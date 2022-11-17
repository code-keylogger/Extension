import json
import sys

f = open("prob.json")
problem = json.load(f)
f.close()

fun_call = problem["problem"]["funCall"]

with open(sys.argv[1], 'r') as file:
    solution = file.read()

with open('compile.py','r') as file:
    data = solution + "\n\n"
    data += file.read()
    data = data.replace('__FUNCCALL__', fun_call)

with open('exec.py', 'w') as file:
    file.write(data)

