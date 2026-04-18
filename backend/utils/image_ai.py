import re

def detect_qr_scam(text: str) -> tuple[int, list[str]]:
    score = 0
    reasons = []

    text = text.lower()

    if "scan" in text and "pay" in text:
        score += 40
        reasons.append("QR payment scam pattern detected")

    if "upi" in text and "scan" in text:
        score += 30
        reasons.append("UPI QR scam detected")

    return score, reasons


def detect_payment_scam(text: str) -> tuple[int, list[str]]:
    score = 0
    reasons = []

    keywords = ["pay now", "send money", "transfer", "upi", "rs", "₹"]

    if any(k in text.lower() for k in keywords):
        score += 30
        reasons.append("Payment request detected in image")

    return score, reasons


def detect_fake_offer(text: str) -> tuple[int, list[str]]:
    score = 0
    reasons = []

    if "winner" in text.lower() or "prize" in text.lower():
        score += 30
        reasons.append("Fake prize / lottery detected")

    if "limited time" in text.lower():
        score += 20
        reasons.append("Pressure tactic detected")

    return score, reasons


def analyze_image_ai(text: str) -> dict:
    total_score = 0
    all_reasons = []

    detectors = [
        detect_qr_scam,
        detect_payment_scam,
        detect_fake_offer,
    ]

    for detector in detectors:
        score, reasons = detector(text)
        total_score += score
        all_reasons.extend(reasons)

    return {
        "ai_score": min(total_score, 100),
        "ai_reasons": all_reasons
    }