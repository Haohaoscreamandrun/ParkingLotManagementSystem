def fib(n):
  if n == 0:
    return 0
  elif n == 1:
    return 1
  else:
    return fib(n-2)+fib(n-1)
  
print(fib(30))

def fib_loop(n):
  if n == 0:
    return 0
  elif n == 1:
    return 1
  
  a, b = 0, 1
  for i in range(2, n+1): 
    a, b = b, a+b
  
  return b
  

print(fib_loop(30))
