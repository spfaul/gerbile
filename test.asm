format ELF64 executable 3
segment readable executable
entry main
main:
    mov eax, [mem_ptr]
    add eax, 0
    mov dword[mem + eax], 3
    mov eax, [mem_ptr]
    add eax, 4
    mov dword[mem + eax], 5
    mov rax, 60
    mov rdi, 0
    syscall
segment readable writable
mem rb 100
mem_ptr dd 0