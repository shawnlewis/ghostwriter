import hf_model
from model_interface import MultiModelProvider, PrefixTemplate, PrefixedModel
from mon_sdk import monitor

shakespeare = PrefixTemplate("Shakespeare", "The following text is in the style of william shakespeare: ")
gpt2_model = hf_model.HfModel('gpt2')

model = MultiModelProvider( # TODO: these probably need to be functions so we can instantiate them in processes
    {
        'gpt2-vanilla': gpt2_model,
        'gpt2-shakespeare': PrefixedModel(shakespeare, gpt2_model),
    }
)

@monitor()
def handle_request(
        model_id: str,
        text: str,
        username: str,
        session_id: str,
        max_length: int = 50,
) -> str:
    """Generate text from the given model and text."""
    return model.gen(model_id, text, max_length)
