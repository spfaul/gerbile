global _start

section .text

_start:		
	MOV rax, 0x1 ; write syscall
	MOV rdi, 0x1 ; choose stdout
	MOV rsi, msg
	MOV rdx, msglength
	SYSCALL

	; exit
	MOV rax, 0x3C
	MOV rdi, 0x0 ; error code 0
	SYSCALL

section .data
	msg: DB "Test"
	msglength: EQU 0x20