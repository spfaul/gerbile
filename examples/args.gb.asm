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
    mov rsi, qword[mem + rax + 0]
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
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
    mov rsi, qword[mem + rax + 0]
    push rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
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
    mov rsi, qword[mem + rax + 0]
    push rsi
    push mem_1
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
main:
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 8], rsi
    push str_1
    add [mem_ptr], 24
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print
    sub [mem_ptr], 24
    push rsi
    pop rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call print_int
    sub [mem_ptr], 16
    push rsi
    pop rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 8]
    push rsi
    add [mem_ptr], 16
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call println
    sub [mem_ptr], 16
    push rsi
    pop rsi
addr_0:
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    mov rdi, 1
    pop rsi
    sub rsi, rdi
    push rsi
    mov rdi, 0
    pop rsi
    cmp rsi, rdi
    mov rsi, 0
    mov rdi, 1
    cmovne rsi, rdi
    push rsi
    mov rcx, 0
    pop rsi
    cmp rcx, rsi
    je addr_1
addr_2:
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 16], rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 16]
    push rsi
    add [mem_ptr], 24
    mov rax, [mem_ptr]
    pop rsi
    mov qword[mem + rax + 0], rsi
    call println
    sub [mem_ptr], 24
    push rsi
    pop rsi
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax + 0]
    push rsi
    mov rdi, 1
    pop rsi
    sub rsi, rdi
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
segment readable writable
mem rb 600000
mem_ptr dq 0
mem_0: rb 8
str_0: db 10, 0
mem_1: rb 20
str_1: db 78, 111, 46, 32, 111, 102, 32, 97, 114, 103, 115, 58, 32, 0
