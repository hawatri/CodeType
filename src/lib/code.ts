
export const snippets = {
  javascript: [
`function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`,
`const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};`,
`async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
  }
}`
  ],
  python: [
`def fibonacci(n):
    a, b = 0, 1
    while a < n:
        yield a
        a, b = b, a + b

for num in fibonacci(50):
    print(num)`,
`import os

def list_files(startpath):
    for root, dirs, files in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        print(f'{indent}{os.path.basename(root)}/')
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print(f'{subindent}{f}')`,
`class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        print("Woof!")`
  ],
  c: [
`#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
`#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}`,
`#include <stdio.h>

long factorial(int n) {
    if (n == 0)
        return 1;
    else
        return n * factorial(n - 1);
}`
  ],
  "c++": [
`#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
`#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> msg {"Hello", "C++", "World", "from", "VS Code!"};

    for (const std::string& word : msg) {
        std::cout << word << " ";
    }
    std::cout << std::endl;
}`,
`#include <iostream>

class Rectangle {
    int width, height;
  public:
    void set_values (int,int);
    int area() {return width*height;}
};

void Rectangle::set_values (int x, int y) {
    width = x;
    height = y;
}`
  ]
};
