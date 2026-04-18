from urllib.parse import urlparse

SUSPICIOUS_TLDS = ['.xyz', '.info', '.top', '.click', '.ru']

def analyze_domain(url: str) -> dict:
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        score = 0
        reasons = []

        if any(tld in domain for tld in SUSPICIOUS_TLDS):
            score += 30
            reasons.append("Suspicious domain extension")

        if len(domain) > 25:
            score += 20
            reasons.append("Unusually long domain")

        if any(char.isdigit() for char in domain):
            score += 10
            reasons.append("Numbers in domain (possible fake)")

        return {
            "domain": domain,
            "domain_score": score,
            "domain_reasons": reasons
        }

    except Exception:
        return {"domain": "", "domain_score": 0, "domain_reasons": []}