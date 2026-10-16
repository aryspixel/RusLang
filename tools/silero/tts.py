"""Offline Silero speech generation. No network requests during synthesis."""
import argparse
import array
import json
import os
from pathlib import Path
import re
import sys
import wave
from xml.sax.saxutils import escape
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
MODEL_ID = 'v5_6_ru'
VOICES = ('aidar', 'baya', 'kseniya', 'xenia', 'eugene')


def chunks(text, limit=450):
    """Prefer sentence boundaries; split long sentences at whitespace."""
    current = ''
    for sentence in re.split(r'(?<=[.!?…])\s+|\n+', text.strip()):
        for word in sentence.split():
            if len(word) > limit:
                raise ValueError('Слишком длинное слово: разбейте текст пробелами.')
            if len(current) + len(word) + 1 > limit:
                yield current
                current = ''
            current = f'{current} {word}'.strip()
        if current:
            yield current
            current = ''


def main():
    parser = argparse.ArgumentParser(description='Локальная русская озвучка Silero → WAV')
    source = parser.add_mutually_exclusive_group()
    source.add_argument('--text', help='Текст для озвучки')
    source.add_argument('--file', type=Path, help='Текстовый файл UTF-8')
    source.add_argument('--ssml-file', type=Path, help='SSML UTF-8 с корнем speak; отдельные предложения можно обернуть в s')
    parser.add_argument('--output', type=Path, default=ROOT / '.local/silero/output/speech.wav')
    parser.add_argument('--speaker', choices=VOICES, default='xenia')
    parser.add_argument('--model', choices=('v5_6_ru', 'v5_5_ru'), default=MODEL_ID,
                        help='Версия модели; v5_5_ru — для возврата к предыдущей версии')
    parser.add_argument('--rate', choices=('x-slow', 'slow', 'medium', 'fast', 'x-fast'), default='medium', help='Темп речи; slow — медленнее обычного')
    parser.add_argument('--pause-ms', type=int, default=200, help='Дополнительная пауза между предложениями, мс (0–10000)')
    parser.add_argument('--sample-rate', type=int, choices=(8000, 24000, 48000), default=48000)
    parser.add_argument('--threads', type=int, default=min(4, os.cpu_count() or 1))
    parser.add_argument('--list-voices', action='store_true')
    parser.add_argument('--no-stress', action='store_true', help='Отключить автоударения')
    parser.add_argument('--no-yo', action='store_true', help='Отключить автоматическую ё')
    parser.add_argument('--no-stress-homo', action='store_true', help='Отключить автоударения в омографах')
    parser.add_argument('--no-yo-homo', action='store_true', help='Отключить автоматическую ё в омографах')
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()
    if args.list_voices:
        print('\n'.join(VOICES))
        return
    if not args.text and not args.file and not args.ssml_file:
        parser.error('Укажите --text, --file или --ssml-file.')
    if args.threads < 1:
        parser.error('--threads должен быть больше нуля.')
    if not 0 <= args.pause_ms <= 10000:
        parser.error('--pause-ms должен быть от 0 до 10000.')
    source_file = args.ssml_file or args.file
    text = source_file.read_text(encoding='utf-8-sig') if source_file else args.text
    if not text.strip():
        parser.error('Текст пуст.')
    model_file = ROOT / '.local' / 'silero' / 'models' / f'{args.model}.pt'
    if not model_file.is_file():
        parser.error(f'Модель {args.model} отсутствует. Установка и SHA256: docs/LOCAL_TTS.md; '
                     'для прежней установки используйте --model v5_5_ru.')
    output = args.output.resolve()
    if output.suffix.lower() != '.wav':
        parser.error('Выходной файл должен иметь расширение .wav.')
    sidecar = output.with_suffix('.wav.json')
    if not args.overwrite and (output.exists() or sidecar.exists()):
        parser.error('Выходной файл уже существует. Укажите другой путь или --overwrite.')
    if args.ssml_file:
        try:
            root = ET.fromstring(text)
        except ET.ParseError as error:
            parser.error(f'Некорректный SSML: {error}')
        if root.tag != 'speak':
            parser.error('Корневой элемент SSML должен быть speak.')
        def inner_xml(element):
            return escape(element.text or '') + ''.join(ET.tostring(child, encoding='unicode') for child in element)
        sentences = list(root)
        if sentences and all(child.tag == 's' for child in sentences) and not (root.text or '').strip() and not any((child.tail or '').strip() for child in sentences):
            parts = [inner_xml(child) for child in sentences]
        else:
            parts = [inner_xml(root)]
        spoken_text = ' '.join(''.join(root.itertext()).split())
        if not spoken_text:
            parser.error('В SSML нет текста для озвучки.')
    else:
        parts = list(chunks(text))
        spoken_text = text
    import torch
    torch.set_num_threads(args.threads)
    print('Загрузка локальной модели…', flush=True)
    model = torch.package.PackageImporter(str(model_file)).load_pickle('tts_models', 'model')
    model.to(torch.device('cpu'))
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(output.name + '.part')
    frames = 0
    try:
        with wave.open(str(temporary), 'wb') as wav, torch.inference_mode():
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(args.sample_rate)
            for index, part in enumerate(parts):
                print(f'Озвучка {index + 1}/{len(parts)}', flush=True)
                content = part if args.ssml_file else escape(part)
                speech = {'text': part} if args.rate == 'medium' and not args.ssml_file else {
                    'ssml_text': f'<speak><prosody rate="{args.rate}">{content}</prosody></speak>'
                }
                audio = model.apply_tts(**speech, speaker=args.speaker,
                                        sample_rate=args.sample_rate,
                                        put_accent=not args.no_stress,
                                        put_yo=not args.no_yo,
                                        put_stress_homo=not (args.no_stress or args.no_stress_homo),
                                        put_yo_homo=not (args.no_yo or args.no_yo_homo))
                pcm = array.array('h', (audio.detach().cpu().flatten().clamp(-1, 1) * 32767).to(torch.int16).tolist())
                if sys.byteorder != 'little':
                    pcm.byteswap()
                wav.writeframes(pcm.tobytes())
                frames += len(pcm)
                if index < len(parts) - 1:
                    pause = args.sample_rate * args.pause_ms // 1000
                    wav.writeframes(b'\x00\x00' * pause)
                    frames += pause
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    sidecar.write_text(json.dumps({
        'model': args.model, 'speaker': args.speaker, 'sample_rate': args.sample_rate,
        'rate': args.rate,
        'pause_ms': args.pause_ms,
        'seconds': round(frames / args.sample_rate, 3), 'text': spoken_text,
        'ssml': text if args.ssml_file else None,
        'put_accent': not args.no_stress, 'put_yo': not args.no_yo,
        'put_stress_homo': not (args.no_stress or args.no_stress_homo),
        'put_yo_homo': not (args.no_yo or args.no_yo_homo),
        'source': 'https://github.com/snakers4/silero-models',
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Готово: {output}')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, RuntimeError, ImportError) as error:
        print(f'Ошибка: {error}', file=sys.stderr)
        sys.exit(1)
