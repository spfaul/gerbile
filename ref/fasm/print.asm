format ELF64 executable 3

segment readable executable 

entry start

start:		
	MOV rax, 1 ; write syscall
	MOV rdi, 1 ; choose stdout
    mov rsi, msg
	MOV rdx, 20
	SYSCALL

	; exit
	MOV rax, 60 ; sys_exit
	MOV rdi, 0 ; error code 0
	SYSCALL


segment readable writable
msg: DB 122, 10
