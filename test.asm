format ELF64 executable 3
segment readable executable
entry main
main:
	mov rax, 60
	mov rdi, 0
	syscall
segment readable writable
