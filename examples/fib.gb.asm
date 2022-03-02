format ELF64 executable 3
segment readable executable
entry main
include "../std/std.asm"
print:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call strlen
    sub [mem_ptr], 8
    push rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    pop rax
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 24], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 16], rsi
    mov rax, [mem_ptr]
    mov qword[mem + rax + 8], 1
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 1
    call scall3
    sub [mem_ptr], 16
    push rsi
    pop rsi
    ret
println:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print
    sub [mem_ptr], 8
    push rsi
    pop rsi
    push str_0
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print
    sub [mem_ptr], 16
    push rsi
    pop rsi
    ret
main:
    mov rsi, 1
    push rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
addr_0:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    mov rdi, 20
    pop rsi
    cmp rsi, rdi
    mov rsi, 0
    mov rdi, 1
    cmovl rsi, rdi
    push rsi
    mov rcx, 0
    pop rsi
    cmp rcx, rsi
    je addr_1
addr_2:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call fib
    sub [mem_ptr], 8
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print_int
    sub [mem_ptr], 8
    push rsi
    pop rsi
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    mov rdi, 1
    pop rsi
    add rsi, rdi
    push rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    jmp addr_0
    jmp addr_0
addr_1:
    mov rsi, 0
    push rsi
    mov rax, 60
    pop rdi
    syscall
    ret
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
    jne addr_4
    jmp addr_5
addr_4:
    push rax
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    pop rax
    push rsi
    pop rsi
    ret
    jmp addr_3
addr_5:
    jmp addr_6
addr_6:
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
    jmp addr_3
addr_3:
    ret
segment readable writable
mem rb 600000
mem_ptr dq 0
str_0: db 10, 0
