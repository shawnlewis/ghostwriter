from model_provider import multi_model

def handle_request(
        model_id: str,
        text: str,
        username: str,
        session_id: str,
        max_length: int = 50,
) -> str:
    """Generate text from the given model and text."""
    return multi_model.gen(model_id, text, max_length)
