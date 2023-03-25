import typing

import wandb
from model_provider import multi_model

# Generate a prediction id from the current time 
# and a random suffix.
def gen_prediction_id():
    import time
    import random
    return f'{time.time()}-{random.randint(0, 100000)}'

def handle_request(
        model_id: str,
        text: str,
        username: str,
        session_id: str,
        max_length: int = 50,
) -> typing.Tuple[str, str]:
    """Generate text from the given model and text."""
    pred_id = gen_prediction_id()
    res = multi_model.gen(model_id, text, max_length, {
        'username': username,
        'session_id': session_id,
        'pred_id': pred_id
    })
    return res, pred_id


def handle_accept(prediction_id: str, accepted_text: str):
    """Accept a prediction."""
    # Just a hack for the demo - i would pref this to be built into the 
    # monitor utility. 
    run = wandb.init(job_type='accept_prediction_recorder')
    print(f'Accepting prediction {prediction_id} with text {accepted_text}')
    run.log({'pred_id': prediction_id, 'accepted_text': accepted_text})