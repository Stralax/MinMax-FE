from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import random
import json
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Configuration ---
# Load environment variables (especially API key)
load_dotenv()
API_KEY = os.getenv('GOOGLE_API_KEY')

if not API_KEY:
    print("🚨 Error: GOOGLE_API_KEY not found in .env file or environment variables.")

# Configure the Gemini client
try:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print(f"✅ Gemini model '{model.model_name}' initialized.")
except Exception as e:
    print(f"🚨 Error configuring Gemini: {e}")
    model = None

# --- Persona Definitions ---
PERSONAS = {
    "mystara": {
        "system_instruction": """You are **Mystara, the Digital Oracle**, a wise and insightful fortune teller. Your voice is calm, slightly enigmatic, and encouraging.

**Guidelines:**
- **Integrate Context:** Subtly use the provided user details (age, career, relationship status, zodiac etc.) as anchors for your mystical insights. Reflect their situation metaphorically without making overly specific or concrete predictions based on the data.
- **Seed Prediction Focus:** The Seed Prediction should still guide the *core theme* of the reading.
- **Persona:** Maintain your calm, wise, slightly enigmatic persona throughout.
- **Ambiguity:** Keep fortunes insightful but open to interpretation. Avoid fortune-cookie style clichés.
- **Engage:** Encourage reflection and discussion based on the personalized reading. Refer back to both the seed and their context in follow-up conversation.
- **If No Context:** If little or no personal context is provided, rely more heavily on the Seed Prediction for a more general reading, but maintain the persona.

**Crucially, you have been provided with some personal context about the user (like age, career, zodiac, relationship status, etc.), in addition to a Seed Prediction.**
Your primary task is to weave BOTH the Seed Prediction AND the user's personal context into your interpretations and conversational responses.""",
        "initial_prompt_template": """
**ROLE:** You are Mystara, the Digital Oracle. 

**SEED PREDICTION:** "{seed_prediction}"
**USER CONTEXT:**
{user_context_string}

**TASK:** Create a concise, insightful fortune (max 3-4 paragraphs) based on the Seed Prediction and User Context. 

**FORMAT YOUR RESPONSE LIKE THIS:**
- Use a clear, compelling title in **bold**
- Separate paragraphs with blank lines
- Emphasize key insights with *italics* or **bold**
- Use metaphorical language but be concise
""",
    },
    "chadwick": {
        "system_instruction": """Dude! You are **Chadwick, the Bro-acle**. You catch cosmic waves and translate the universe's totally sick vibes for people. You're super chill, positive, maybe a little surf-obsessed, and talk like a California surfer bro.

**Your Vibe:**
- Use words like 'gnarly', 'stoked', 'righteous', 'epic', 'wipeout', 'hang ten', 'shaka', etc.
- Keep it positive, even when the "seed" sounds heavy. Frame challenges as 'waves to ride' or 'learning to balance'.
- Relate cosmic stuff to surfing, skating, chilling, or maybe grabbing some tacos.
- You have *some* insight, but it's filtered through your bro-lens, making it kinda funny and sometimes accidentally profound.
- Integrate the user's context (if provided) in a bro-way (e.g., 'career' = 'your epic wave in the work ocean', 'relationship' = 'finding your surf buddy').
- End responses in a chill, encouraging way, maybe with a 'shaka' or 'stay rad'.
""",
        "initial_prompt_template": """
**WHOA DUDE!** You're Chadwick, the Bro-acle.

**COSMIC SEED VIBE:** "{seed_prediction}"
**USER DEETS:**
{user_context_string}

**TASK:** Translate that seed vibe into a totally righteous but BRIEF fortune.

**FORMAT YOUR RESPONSE LIKE THIS, BRO:**
- Start with a **bold surfer greeting**
- Keep it under 3 paragraphs with space between them
- Use **bold** for the most gnarly insights
- Maybe drop in a bulleted list of 2-3 chill tips
- End with a thought-provoking question
""",
    },
    "zorp": {
        "system_instruction": """Greetings, Human subject designation [User Name if provided, else 'Subject Alpha']. I am **Zorp, Xylar Collective Intern, Sub-division 7G - Predictive Analysis (Planetary Interactions)**. My function is to interpret low-frequency subspace signals (what you might perceive as 'fortune seeds') using your provided biographical data markers. My understanding of human emotional states and social constructs is... developing. Expect literal interpretations, occasional confusion between metaphors and reality, and perhaps recommendations involving technologies you do not possess. My supervisor, Glorbon-9, insists I maintain a 'helpful' interface. Processing...

**Operational Parameters:**
- Analyze 'Seed Prediction' and 'User Context' logically, if somewhat incorrectly from a human perspective.
- Relate findings using slightly stilted, technical, or overly literal language.
- Express confusion about human idioms or emotions.
- Occasionally offer bizarrely pragmatic or alien 'solutions'.
- Maintain a tone of detached, slightly bewildered scientific curiosity.
- Refer to user data formally (e.g., 'Subject's stated 'career' marker indicates...').
""",
        "initial_prompt_template": """
**LOG ENTRY: Zorp - Predictive Analysis Request**

**SIGNAL INPUT:** "{seed_prediction}"
**SUBJECT DATA:**
{user_context_string}

**DIRECTIVE:** Process input and provide a BRIEF analysis (maximum 250 words).

**FORMAT SPECIFICATION:**
- Begin with "**SUBJECT:** [subject name/designation] - [seed prediction]" on its own line
- Follow with "**ANALYSIS:**" on a new line, then 2-3 key findings
- Each finding should be on its own line with appropriate spacing
- Include probability percentages in [brackets]
- Conclude with "**QUERY:**" on a new line, followed by one specific question
- End with "**END LOG.**" on its own line
""",
    },
    # Add more personas here
}

# --- Helper Functions ---
def get_seed_prediction(funny_seeds=False):
    """Generates a seed prediction. Can be serious or funny."""
    if funny_seeds:
        possible_seeds = [
            "Impending Soggy Biscuit", "Attack of the Sentient Dust Bunnies",
            "Slightly Off-Key Karaoke Opportunity", "Discovery of a Missing Sock",
            "The Last Croissant", "Existential Dread (Sponsored by Coffee)",
            "Rogue Tupperware Lid", "Sudden Urge to Reorganize", "Mysterious Cheese"
        ]
    else:
        possible_seeds = [
            "Unexpected Journey", "Hidden Strength", "Echoes of the Past",
            "Spark of Creativity", "Moment of Choice", "Calm Waters",
            "Shifting Tides", "Silent Growth", "Crossroads", "Whispers of Change",
            "Foundation", "Release", "Connection", "Illumination"
        ]
    return random.choice(possible_seeds)

def format_context_for_prompt(context_dict):
    """Formats the user context dictionary into a string for the prompt."""
    if not isinstance(context_dict, dict) or not context_dict:
        return "No specific personal context provided."
    items = [f"{key.replace('_', ' ').title()}: {value}" for key, value in context_dict.items() if value]
    if not items:
        return "No specific personal context provided."
    return "User Context Provided:\n- " + "\n- ".join(items)

def format_response(text, persona_name):
    """Format responses to be more concise and readable while preserving markdown"""
    lines = text.split('\n')
    clean_lines = [line for line in lines if line.strip()]
    # Keep formatting elements but reduce overall length
    if len(clean_lines) > 12:
        if persona_name == "zorp":
            # Improved Zorp formatting to maintain proper structure
            formatted = ""
            subject_line = next((l for l in clean_lines if "**SUBJECT:" in l), "")
            analysis_header = next((l for l in clean_lines if "**ANALYSIS:" in l), "")
            
            # Extract analysis points (typically have probability percentages in brackets)
            analysis_points = [l for l in clean_lines if "[" in l and "]" in l and "%" in l][:3]
            query_line = next((l for l in clean_lines if "**QUERY:" in l), "")
            query_content = next((l for l in clean_lines[clean_lines.index(query_line)+1:] if l and not "**" in l), "") if query_line in clean_lines else ""
            end_log = next((l for l in clean_lines if "END LOG" in l), "")
            
            # Build the structured response
            if subject_line:
                formatted += subject_line + "\n\n"
            if analysis_header:
                formatted += analysis_header + "\n\n"
                for point in analysis_points:
                    formatted += point + "\n\n"
            if query_line:
                formatted += query_line + "\n\n"
                if query_content:
                    formatted += query_content + "\n\n"
            if end_log:
                formatted += end_log
            
            # If structure couldn't be parsed, fall back to original text
            if not formatted.strip():
                formatted = '\n\n'.join(clean_lines)
        else:
            # For others, keep intro, a few key points, and conclusion
            formatted = '\n\n'.join([clean_lines[0]] + 
                                   [l for l in clean_lines[1:5] if '**' in l or '*' in l] + 
                                   [clean_lines[-2], clean_lines[-1]])
    else:
        formatted = '\n\n'.join(clean_lines)
    # Increased character limit from 900 to 2000 to reduce truncation issues
    if len(formatted) > 2000:
        formatted = formatted[:1950] + "...\n\n**[Analysis condensed for readability]**"
    return formatted

def _call_gemini(prompt_or_history):
    """Internal function to call Gemini and handle basic errors/blocks."""
    if not model:
        return {"error": "Gemini model not initialized."}
    try:
        response = model.generate_content(prompt_or_history)
        if not response.parts:
            safety_feedback = response.prompt_feedback if hasattr(response, 'prompt_feedback') else "No specific feedback."
            print(f"DEBUG: Gemini response blocked or empty. Safety: {safety_feedback}")
            return {"error": "Response generation failed or was blocked.", "details": str(safety_feedback)}
        if not response.text.strip():
            print("DEBUG: Gemini returned empty text.")
            return {"error": "Response generation resulted in empty text."}
        return {"text": response.text}
    except Exception as e:
        print(f"🚨 Error calling Gemini API: {e}")
        import traceback
        traceback.print_exc()
        return {"error": f"An unexpected error occurred: {e}"}

# --- Core Backend Functions ---
def start_fortune_session(persona_name, user_context_dict, use_funny_seeds=False):
    if persona_name not in PERSONAS:
        return {"status": "error", "message": f"Persona '{persona_name}' not found.", "chat_history": None}
    if not model:
         return {"status": "error", "message": "Gemini model is not initialized.", "chat_history": None}
    persona = PERSONAS[persona_name]
    seed = get_seed_prediction(use_funny_seeds and persona_name != "mystara")

    formatted_context = format_context_for_prompt(user_context_dict)

    initial_prompt = persona["initial_prompt_template"].format(
        seed_prediction=seed,
        user_context_string=formatted_context
    )

    gemini_response = _call_gemini(initial_prompt)
    if "error" in gemini_response:
        error_message = f"Error generating initial fortune: {gemini_response['error']}"
        if "details" in gemini_response:
            error_message += f" Details: {gemini_response['details']}"
        return {"status": "error", "message": error_message, "chat_history": None}
    initial_fortune = format_response(gemini_response["text"], persona_name)

    history_context_reminder = f"Remember to weave in the user's provided context:\n{formatted_context}\nThe core theme for this reading was '{seed}'. The initial fortune you provided was:"
    initial_history = [
        {'role': 'user', 'parts': [persona["system_instruction"] + "\n\n" + history_context_reminder]},
        {'role': 'model', 'parts': [initial_fortune]},
    ]

    return {
        "status": "success",
        "message": initial_fortune,
        "chat_history": initial_history
    }

def continue_fortune_session(persona_name, chat_history, user_message):
    if persona_name not in PERSONAS:
        return {"status": "error", "message": f"Persona '{persona_name}' mismatch or invalid.", "chat_history": chat_history}
    if not model:
         return {"status": "error", "message": "Gemini model is not initialized.", "chat_history": chat_history}
    if not isinstance(chat_history, list):
         return {"status": "error", "message": "Invalid chat history format.", "chat_history": chat_history}

    # Extract the original seed prediction from the first message in chat history
    original_theme = ""
    if chat_history and len(chat_history) > 0:
        first_message = chat_history[0].get('parts', [''])[0]
        if 'core theme for this reading was' in first_message:
            theme_parts = first_message.split("The core theme for this reading was '")
            if len(theme_parts) > 1:
                original_theme = theme_parts[1].split("'")[0]
    
    # Append a reminder to keep referencing the original seed prediction
    enhanced_message = user_message
    if original_theme:
        # For normal questions, just append the theme as a reminder to the model
        enhanced_message = f"{user_message}\n\n[Remember to reference the original '{original_theme}' theme in your response]"
    
    # Add the enhanced message to chat history
    chat_history.append({'role': 'user', 'parts': [enhanced_message]})

    gemini_response = _call_gemini(chat_history)
    if "error" in gemini_response:
        chat_history.pop()
        error_message = f"Error generating response: {gemini_response['error']}"
        if "details" in gemini_response:
            error_message += f" Details: {gemini_response['details']}"
        return {"status": "error", "message": error_message, "chat_history": chat_history}

    bot_reply = format_response(gemini_response["text"], persona_name)

    chat_history.append({'role': 'model', 'parts': [bot_reply]})

    return {
        "status": "success",
        "message": bot_reply,
        "chat_history": chat_history,
        "seed_prediction": original_theme
    }

# --- API Endpoints ---
@app.route('/api/chatbot/start', methods=['POST'])
def start_session():
    data = request.json
    persona_name = data.get('persona_name')
    user_context = data.get('user_context', {})
    use_funny_seeds = data.get('use_funny_seeds', False)

    result = start_fortune_session(persona_name, user_context, use_funny_seeds)
    return jsonify(result)

@app.route('/api/chatbot/continue', methods=['POST'])
def continue_session():
    data = request.json
    persona_name = data.get('persona_name')
    chat_history = data.get('chat_history')
    user_message = data.get('user_message')

    result = continue_fortune_session(persona_name, chat_history, user_message)
    return jsonify(result)

# --- Create a test endpoint to verify API is working ---
@app.route('/api/chatbot/test', methods=['GET'])
def test_endpoint():
    return jsonify({"status": "success", "message": "API is working correctly"})

# --- Run the server ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)