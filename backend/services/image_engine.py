from __future__ import annotations

import base64
import binascii
import io
from typing import Any
from backend.utils.image_ai import analyze_image_ai
from backend.services.scoring_engine import score_signals
from backend.services.text_engine import analyze_text_payload
from backend.utils.helpers import content_hash, normalize_text, utc_now_iso
import pytesseract
from PIL import Image
import base64
import io

def extract_text_from_image(image_b64):
    try:
        img_data = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(img_data))

        return pytesseract.image_to_string(image)
    except:
        return ""

def _decode_image(image_b64: str) -> bytes:
    cleaned = image_b64.split(',')[-1]
    try:
        return base64.b64decode(cleaned, validate=False)
    except binascii.Error:
        return b''


def _extract_ocr_text(image_bytes: bytes) -> str:
    try:
        from PIL import Image  # type: ignore
    except Exception:
        return ''

    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception:
        return ''

    ocr_text = ''
    try:
        import pytesseract  # type: ignore

        ocr_text = pytesseract.image_to_string(image) or ''
    except Exception:
        ocr_text = ''

    return normalize_text(ocr_text)


def analyze_image_payload(payload: dict):

    # Step 1: Get image
    image_b64 = payload.get("image_b64") or payload.get("image") or ""

    image_bytes = b""
    if image_b64:
        try:
            import base64
            image_bytes = base64.b64decode(image_b64)
        except Exception:
            image_bytes = b""

    # Step 2: OCR extraction
    ocr_text = ""
    try:
        from backend.services.image_engine import _extract_ocr_text
        ocr_text = _extract_ocr_text(image_bytes) if image_bytes else ""
    except Exception:
        ocr_text = ""

    # Step 3: Merge text
    payload["text"] = (payload.get("text") or "") + " " + ocr_text

    # Step 4: Run text analysis
    from backend.services.text_engine import analyze_text_payload

    text_result = analyze_text_payload({
        "url": payload.get("url") or "",
        "title": payload.get("title") or "",
        "text": payload["text"],
        "source": "image",
    })

    # Step 5: AI Image detection
    from backend.utils.image_ai import analyze_image_ai

    ai_result = analyze_image_ai(payload["text"])

    # Step 6: Merge scores
    text_result["risk_score"] = min(
        text_result.get("risk_score", 0) + ai_result["ai_score"],
        100
    )

    # Step 7: Merge reasons
    text_result.setdefault("reasons", [])
    text_result["reasons"].extend(ai_result["ai_reasons"])

    return text_result

    signals = list(text_result['signals'])
    if image_bytes:
        signals.append(
            {
                'name': 'image_decoded',
                'category': 'media',
                'weight': 4,
                'matched': ['base64 image decoded'],
                'details': 'Image content was successfully decoded for inspection.',
            }
        )

    if combined_text and any(term in combined_text.lower() for term in ['otp', 'login', 'password', 'verify', 'gift', 'lottery', 'wallet', 'bank']):
        signals.append(
            {
                'name': 'ocr_fraud_text',
                'category': 'ocr',
                'weight': 18,
                'matched': ['ocr fraud language'],
                'details': 'OCR text contains high-risk language commonly used in scams.',
            }
        )

    score, confidence, status = score_signals(signals, modality='image')
    return {
        'modality': 'image',
        'url': payload.get('url') or payload.get('page_url') or '',
        'title': payload.get('title') or payload.get('page_title') or '',
        'corpus_hash': content_hash(combined_text, payload.get('url') or '', payload.get('title') or '', image_b64[:512]),
        'raw_text': combined_text,
        'signals': signals,
        'risk_score': score,
        'confidence': confidence,
        'status': status,
        'timestamp': utc_now_iso(),
    }

