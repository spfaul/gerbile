format ELF64 executable 3
segment readable executable
entry main
include "../std/std.asm"
sleep:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem_0], rsi
    push mem_0
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    mov qword[mem + rax + 16], 0
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 35
    call scall2
    sub [mem_ptr], 8
    push rsi
    pop rsi
    ret
print:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
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
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
close:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 3
    call scall1
    sub [mem_ptr], 8
    push rsi
    pop rsi
    ret
write:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call strlen
    sub [mem_ptr], 16
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 24], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 16], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 1
    call scall3
    sub [mem_ptr], 16
    push rsi
    pop rsi
    ret
open:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    mov qword[mem + rax + 24], 420
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 16], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 2
    call scall3
    sub [mem_ptr], 16
    push rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 16], rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 16]
    push rsi
    pop rsi
    ret
    ret
read:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    push rsi
    push mem_1
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 24], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 16], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    mov rax, [mem_ptr]
    mov qword[mem + rax + 0], 0
    call scall3
    sub [mem_ptr], 16
    push rsi
    pop rsi
    push mem_1
    pop rsi
    ret
    ret
println_int:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    add [mem_ptr], 8
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print_int
    sub [mem_ptr], 8
    push rsi
    pop rsi
    push str_1
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
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
    push str_2
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print
    sub [mem_ptr], 16
    push rsi
    pop rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
    push str_3
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print
    sub [mem_ptr], 16
    push rsi
    pop rsi
    mov rsi, 0
    push rsi
    mov rax, 60
    pop rdi
    syscall
    ret
fib:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    pop rsi
    ret
    jmp addr_3
addr_5:
    jmp addr_6
addr_6:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
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
mem_0: rb 8
str_0: db 10, 0
mem_1: rb 20
str_1: db 10, 0
str_2: db 32, 0
str_3: db 10, 0
