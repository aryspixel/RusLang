"""Generate original speech through OpenRouter without audio post-processing."""

import argparse
import base64
import json
import os
import shutil
import subprocess
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

API = "https://openrouter.ai/api/v1/audio/speech"
MODELS = {
    "seed": "bytedance-seed/seed-audio-1-0",
    "fish": "fish-audio/s2.1-pro",
    "qwen-flash": "qwen/qwen-audio-3.0-tts-flash",
    "qwen-plus": "qwen/qwen-audio-3.0-tts-plus",
}
MAX_REFERENCE_BYTES = 15 * 1024 * 1024


def read_key(env_file):
    for name in ("OPENROUTER_API_KEY", "OPENROUTER_KEY"):
        if os.environ.get(name):
            return os.environ[name].strip()
    if env_file.is_file():
        for line in env_file.read_text().splitlines():
            name, separator, value = line.strip().removeprefix("export ").partition("=")
            if separator and name.strip() in {"OPENROUTER_API_KEY", "OPENROUTER_KEY"}:
                value = value.strip()
                if value.startswith(("'", '"')):
                    value = value[1:].split(value[0], 1)[0]
                else:
                    value = value.split(" #", 1)[0].strip()
                if value:
                    return value
    raise ValueError("No OpenRouter key in environment or selected .env file")


def reference_bytes(path):
    with tempfile.TemporaryDirectory(prefix="openrouter-voice-") as directory:
        wav = Path(directory) / "reference.wav"
        result = subprocess.run(
            ["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-c:a", "pcm_s16le", str(wav)],
            capture_output=True,
        )
        if result.returncode:
            raise ValueError("Could not decode reference audio with ffmpeg")
        if wav.stat().st_size > MAX_REFERENCE_BYTES:
            raise ValueError("Reference WAV exceeds 15 MiB; select a shorter reference")
        return wav.read_bytes()


def build_payload(args):
    prompt_file = getattr(args, "prompt_file", None)
    if prompt_file:
        if args.model != "seed":
            raise ValueError("Raw audio prompts are supported only for Seed")
        if args.description or args.voice or args.reference:
            raise ValueError(
                "Raw prompt mode cannot be combined with voice, description or reference"
            )
        prompt = prompt_file.read_text(encoding="utf-8").strip()
        if not prompt or len(prompt) > 3000:
            raise ValueError("Seed prompt must contain 1–3000 characters")
        return {"model": MODELS["seed"], "input": prompt, "response_format": "mp3"}
    text = args.text_file.read_text(encoding="utf-8").strip()
    if not text:
        raise ValueError("Spoken text is empty")
    if args.model.startswith("qwen"):
        if args.description or args.reference:
            raise ValueError("Qwen reference/voice-description control is unverified on this route")
        if not args.voice:
            raise ValueError("Qwen requires --voice")
    if args.voice and args.reference:
        raise ValueError("Use a preset voice or a reference, not both")
    payload = {"model": MODELS[args.model], "input": text, "response_format": "mp3"}
    if args.model == "seed":
        direction = (
            f"Generate clean solo narration in {args.language}, no music or background sounds."
        )
        if args.reference:
            direction += (
                " Use @Audio1 as the speaker reference. Preserve the speaker's vocal identity,"
                " timbre, age, accent and characteristic expressive delivery."
            )
        if args.description:
            direction += " Voice and delivery: " + args.description
        payload["input"] = (
            direction
            + "\nSpeak ONLY the following text exactly as written, not these directions:\n\n"
            + text
        )
        if len(payload["input"]) > 3000:
            raise ValueError("Seed prompt exceeds 3000 characters; shorten text or directions")
    elif args.description:
        payload["instructions"] = args.description
    if args.voice:
        payload["voice"] = args.voice
    if args.reference:
        data = reference_bytes(args.reference)
        payload["input_references"] = [
            {
                "type": "input_audio",
                "input_audio": {"data": "data:audio/wav;base64," + base64.b64encode(data).decode()},
            }
        ]
    return payload


def summary(payload, args):
    result = {key: value for key, value in payload.items() if key != "input_references"}
    if args.reference:
        result["reference_file"] = str(args.reference.resolve())
    result["output_file"] = str(args.output.resolve())
    result["post_processing"] = "none; original API response bytes"
    return result


def inspect_audio(path):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"],
        check=True,
        capture_output=True,
    )
    return float(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            text=True,
        ).strip()
    )


def generate(args):
    for executable in ("ffmpeg", "ffprobe"):
        if not shutil.which(executable):
            raise ValueError(f"Missing executable: {executable}")
    if args.output.suffix.lower() != ".mp3":
        raise ValueError("Output must have .mp3 extension")
    metadata_path = args.output.with_suffix(".request.json")
    if args.output.exists() or metadata_path.exists():
        raise ValueError("Output or request record exists; inspect before another paid submission")
    payload = build_payload(args)
    metadata = summary(payload, args)
    if args.dry_run:
        print(json.dumps(metadata, ensure_ascii=False, indent=2))
        return
    key = read_key(args.env)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    metadata["status"] = "submitted_or_pending"
    with metadata_path.open("x", encoding="utf-8") as handle:
        json.dump(metadata, handle, ensure_ascii=False, indent=2)
    request = urllib.request.Request(
        API,
        data=json.dumps(payload).encode(),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=240) as response:
            data = response.read()
            metadata["generation_id"] = response.headers.get("X-Generation-Id")
            if not response.headers.get("Content-Type", "").startswith("audio/") or not data:
                raise ValueError("API returned an empty or non-audio response")
        with args.output.open("xb") as handle:
            handle.write(data)
        metadata["status"] = "saved"
        metadata["duration_seconds"] = inspect_audio(args.output)
        metadata["status"] = "complete"
    except Exception as error:
        # Keep uncertain requests reserved; never retry paid calls automatically.
        metadata["error_type"] = type(error).__name__
        if isinstance(error, urllib.error.HTTPError):
            metadata["http_status"] = error.code
        raise
    finally:
        metadata_path.write_text(
            json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    command = commands.add_parser("generate")
    command.add_argument("--model", choices=MODELS, default="seed")
    inputs = command.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--text-file", type=Path)
    inputs.add_argument("--prompt-file", type=Path)
    command.add_argument("--output", type=Path, required=True)
    command.add_argument("--env", type=Path, default=Path.cwd() / ".env")
    command.add_argument("--language", default="Russian")
    command.add_argument("--description")
    command.add_argument("--reference", type=Path)
    command.add_argument("--voice")
    command.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        generate(args)
    except Exception as error:
        # Do not print provider response bodies or credentials.
        detail = (
            str(error)
            if isinstance(error, (ValueError, FileNotFoundError))
            else type(error).__name__
        )
        parser.exit(1, f"Error: {detail}. No automatic retry.\n")


if __name__ == "__main__":
    main()
