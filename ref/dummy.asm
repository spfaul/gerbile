format ELF64 executable 3
segment readable executable
entry main


main:
    mov eax, [mem_ptr]
    mov dword[mem + eax], 3    

    cmp dword[mem+eax], 2
    je succ
    jmp exit

succ:
    call print
    jmp exit
    
exit:
    mov rax, 60
    mov rdi, 0
    syscall

print:
    mov rax, 1
    mov rdi, 1
    mov rsi, msg
    mov rdx, 20
    syscall
    ret
    
segment readable writable
mem rb 100
mem_ptr dd 0
msg db "Hello", 10, 0