package main

import (
	"bufio"
	"fmt"
	"os"
)

type chamado struct {
	Usuario  string
	Problema string
}

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	//listas
	var Chamados []chamado
	//variaveis de controle
	var escolha int
	var nome string
	var problema string

	for {
		//funções
		fmt.Printf("\n----ABERTURA DE CHAMADO----\n\n")
		fmt.Println("1 - Abrir chamado")
		fmt.Println("2 - Listar chamados")
		fmt.Println("3 - Resolver chamadoss")
		fmt.Println("0 - Sair")
		fmt.Print("Oque voce precisa? :")

		scanner.Scan()
		input := scanner.Text()
		_, err := fmt.Sscanf(input, "%d", &escolha)
		if err != nil || escolha < 0 || escolha > 3 {
			fmt.Print("\nNumero invalido!\t Tente novamente!\n")
			continue
		}

		if escolha == 0 {
			break
		}

		if escolha == 1 {
			fmt.Print("Qual seu nome? : ")
			scanner.Scan()
			nome = scanner.Text()

			fmt.Print("Qual o Problema? : ")
			scanner.Scan()
			problema = scanner.Text()

			novo := chamado{Usuario: nome, Problema: problema}
			Chamados = append(Chamados, novo)

		} else if escolha == 2 {
			fmt.Print("\n----CHAMADOS----\n\n")

			for i, c := range Chamados {
				fmt.Printf("ID :[%d] | Nome : %s | Problema : %s\n", i+1, c.Usuario, c.Problema)
			}
			if len(Chamados) == 0 {
				fmt.Print("Nenhum chamado aberto\n")
			}
		} else if escolha == 3 {
			fmt.Print("Qual o id do chamado que você quer remover? :")
			scanner.Scan()
			inputID := scanner.Text()
			var id int
			_, err := fmt.Sscanf(inputID, "%d", &id)
			id = id - 1 // IDs exibidos começam em 1, mas o slice é 0-based
			if err != nil || id < 0 || id >= len(Chamados) {
				fmt.Print("ID invalido! Tente novamente\n")
			} else {
				Chamados = append(Chamados[:id], Chamados[id+1:]...)
				fmt.Print("Chamado removido com sucesso!\n")
			}
		} else {
			fmt.Print("Saindo...")
			break
		}

	}

}
