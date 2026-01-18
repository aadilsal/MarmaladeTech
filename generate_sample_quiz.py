import pandas as pd

# Define the data for the sample quiz
data = [
    {
        "Question": "Which of the following serves as the 'powerhouse' of the cell?",
        "Image": "",
        "A": "Nucleus",
        "B": "Mitochondria",
        "C": "Ribosome",
        "D": "Endoplasmic Reticulum",
        "Answer": "B",
        "Explanation": "Mitochondria are often referred to as the powerhouse of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
    },
    {
        "Question": "What is the primary function of red blood cells?",
        "Image": "",
        "A": "Fight infection",
        "B": "Transport oxygen",
        "C": "Clot blood",
        "D": "Produce hormones",
        "Answer": "B",
        "Explanation": "The primary function of red blood cells (erythrocytes) is to transport oxygen from the lungs to the body's tissues and carbon dioxide from the tissues back to the lungs."
    },
    {
        "Question": "In physics, what is the unit of Force?",
        "Image": "",
        "A": "Joule",
        "B": "Pascal",
        "C": "Newton",
        "D": "Watt",
        "Answer": "C",
        "Explanation": " The Newton (symbol: N) is the International System of Units (SI) derived unit of force."
    },
    {
        "Question": "Which element has the atomic number 1?",
        "Image": "",
        "A": "Helium",
        "B": "Oxygen",
        "C": "Carbon",
        "D": "Hydrogen",
        "Answer": "D",
        "Explanation": "Hydrogen is the chemical element with the symbol H and atomic number 1."
    },
    {
        "Question": "What is the derivative of sin(x)?",
        "Image": "",
        "A": "cos(x)",
        "B": "-cos(x)",
        "C": "tan(x)",
        "D": "-sin(x)",
        "Answer": "A",
        "Explanation": "The derivative of sin(x) with respect to x is cos(x)."
    }
]

# Create a DataFrame
df = pd.DataFrame(data)

# Save to Excel
output_file = "mdcat_sample_quiz.xlsx"
df.to_excel(output_file, index=False)

print(f"Successfully created sample quiz file: {output_file}")
print("Columns:", ", ".join(df.columns))
