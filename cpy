format ELF64 executable 3
segment readable executable
entry main
include "std/std.asm"
main:
    push str_0
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    mov rsi, 3
    push rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    pop rax
    push rsi
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 1
    mov rax, [mem_ptr]
    mov qword[mem + rax + 8], 1
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 16], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 24], rsi ; 3
    call scall3
    sub [mem_ptr], 16
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    push rsi
    mov rax, 60
    pop rdi
    syscall
segment readable writable
mem rb 100
mem_ptr dq 0
str_0: db 104, 101, 108, 108, 111, 10, 0
