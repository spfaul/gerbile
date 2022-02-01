format ELF64 executable 3

segment readable executable 

entry start

start:		
	MOV rax, 0x1 ; write syscall
	MOV rdi, 0x1 ; choose stdout
	MOV rsi, msg
	MOV rdx, 0x20
	SYSCALL

	; exit
	MOV rax, 60 ; sys_exit
	MOV rdi, 0x0 ; error code 0
	SYSCALL


segment readable writable
msg: DB "Test", 10, 0
