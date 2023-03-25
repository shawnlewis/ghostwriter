from mon_sdk import monitor
from model_provider import multi_model
from text_analysis import get_analysis

def handle_request(
        model_id: str,
        text: str,
        username: str,
        session_id: str,
        max_length: int = 50,
) -> str:
    """Generate text from the given model and text."""
    prediction_result = handle_request_raw(model_id=model_id, text=text,username=username,session_id=session_id,max_length=50)
    text = prediction_result.get()
    prediction_result.add_data(get_analysis(text))
    prediction_result.log()
    return text

@monitor(False)
def handle_request_raw(
        model_id: str,
        text: str,
        username: str,
        session_id: str,
        max_length: int = 50,
) -> str:
    """Generate text from the given model and text."""
    return multi_model.gen(model_id, text, max_length)
