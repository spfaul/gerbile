format ELF64 executable 3
segment readable executable
entry main
include "../std/std.asm"
main:
    add [mem_ptr], 0
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 10
    call fib
    sub [mem_ptr], 0
    push rsi
    add [mem_ptr], 0
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print_int
    sub [mem_ptr], 0
    push rsi
    mov rsi, 0
    push rsi
    mov rax, 60
    pop rdi
    syscall
fib:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    mov rdi, 2
    pop rsi
    cmp rsi, rdi
    mov rsi, 0
    mov rdi, 1
    cmovl rsi, rdi
    push rsi
    mov rcx, 0
    pop rsi
    cmp rcx, rsi
    jne addr_1
    jmp addr_2
addr_1:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    pop rsi
    ret
    jmp addr_0
addr_2:
    jmp addr_3
addr_3:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    mov rdi, 1
    pop rsi
    sub rsi, rdi
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call fib
    sub [mem_ptr], 8
    push rsi
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    mov rdi, 2
    pop rsi
    sub rsi, rdi
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call fib
    sub [mem_ptr], 8
    push rsi
    pop rdi
    pop rsi
    add rsi, rdi
    push rsi
    pop rsi
    ret
    jmp addr_0
addr_0:
segment readable writable
mem rb 100
mem_ptr dq 0
