export type Language = 'CPP' | 'PYTHON' | 'JAVA' | 'JAVASCRIPT'

export interface LanguageConfig {
  filename: string
  compile: string | null
  run: string
}

export const languages: { CPP: LanguageConfig; PYTHON: LanguageConfig; JAVA: LanguageConfig; JAVASCRIPT: LanguageConfig } = {
  CPP: {
    filename: 'main.cpp',
    compile: 'g++ -O2 -o main main.cpp',
    run: './main',
  },
  PYTHON: {
    filename: 'main.py',
    compile: null,
    run: 'python3 main.py',
  },
  JAVA: {
    filename: 'Main.java',
    compile: 'javac Main.java',
    run: 'java Main',
  },
  JAVASCRIPT: {
    filename: 'main.js',
    compile: null,
    run: 'node main.js',
  },
}
