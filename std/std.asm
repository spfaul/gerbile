print:
        mov rax, [mem_ptr]
        mov rdi, qword[mem + rax]    
        push    rbp
        mov     rbp, rsp
        sub     rsp, 64
        mov     QWORD [rbp-56], rdi
        mov     QWORD [rbp-8], 1
        mov     rax, QWORD [rbp-56]
        shr     rax, 63
        mov     BYTE [rbp-9], al
        mov     eax, 32
        sub     rax, QWORD [rbp-8]
        mov     BYTE [rbp-48+rax], 10
        cmp     BYTE [rbp-9], 0
        je      .L3
        neg     QWORD [rbp-56]
.L3:
        mov     rcx, QWORD [rbp-56]
        mov     rdx, 7378697629483820647
        mov     rax, rcx
        imul    rdx
        mov     rax, rdx
        sar     rax, 2
        mov     rsi, rcx
        sar     rsi, 63
        sub     rax, rsi
        mov     rdx, rax
        mov     rax, rdx
        sal     rax, 2
        add     rax, rdx
        add     rax, rax
        sub     rcx, rax
        mov     rdx, rcx
        mov     eax, edx
        lea     edx, [rax+48]
        mov     eax, 31
        sub     rax, QWORD [rbp-8]
        mov     BYTE [rbp-48+rax], dl
        add     QWORD [rbp-8], 1
        mov     rcx, QWORD [rbp-56]
        mov     rdx, 7378697629483820647
        mov     rax, rcx
        imul    rdx
        mov     rax, rdx
        sar     rax, 2
        sar     rcx, 63
        mov     rdx, rcx
        sub     rax, rdx
        mov     QWORD [rbp-56], rax
        cmp     QWORD [rbp-56], 0
        jne     .L3
        cmp     BYTE [rbp-9], 0
        je      .L4
        mov     eax, 31
        sub     rax, QWORD [rbp-8]
        mov     BYTE [rbp-48+rax], 45
        add     QWORD [rbp-8], 1
.L4:
        mov     eax, 32
        sub     rax, QWORD [rbp-8]
        lea     rdx, [rbp-48]
        lea     rcx, [rdx+rax]
        mov     rax, QWORD [rbp-8]
        mov     rdx, rax
        mov     rsi, rcx
        mov     edi, 1
        mov     rax, 1
        syscall
        nop
        leave
        ret

scall4:
   ; push params
    mov rax, [mem_ptr]
    mov rsi, qword[mem + rax]
    push rsi
    mov rax, [mem_ptr]
    add rax, 8
    mov rsi, qword[mem + rax]
    push rsi
    mov rax, [mem_ptr]
    add rax, 16
    mov rsi, qword[mem + rax]
    push rsi
    mov rax, [mem_ptr]
    add rax, 24
    mov rsi, qword[mem + rax]
    push rsi
    ; do syscall
    pop rdx
    pop rsi
    pop rdi
    pop rax
    syscall
    ret