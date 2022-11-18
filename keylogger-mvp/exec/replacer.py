import json
import sys

f = open("prob.json")
problem = json.load(f)
f.close()

lang = problem["problem"]["lang"]

if(lang.lower() == "python"):
    fun_call = problem["problem"]["funCall"]

    with open(sys.argv[1], 'r') as file:
        solution = file.read()

    with open('compile.py','r') as file:
        data = solution + "\n\n"
        data += file.read()
        data = data.replace('__FUNCCALL__', fun_call)

    with open('exec.py', 'w') as file:
        file.write(data)

if (lang.lower() == "coq"):
    fun_sig = problem["problem"]["funcSig"]
    with open(sys.argv[1], 'r') as file:
        solution = file.read()
    
    with open('run.v', 'w') as file:
        file.write(solution)
