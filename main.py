#criando uma tela de login em flat
#importando as bibliotecas
from tkinter import *
from tkinter import messagebox
#criando a janela
janela = Tk()
janela.title("Tela de Login")
janela.geometry("300x200")
janela.configure(background = "#dde")
#criando os widgets
label_usuario = Label(janela, text = "Usuário", bg="red", fg="white")
label_usuario.place(relx=0.5, rely=0.5)
#iniciando o loop
janela.mainloop()
