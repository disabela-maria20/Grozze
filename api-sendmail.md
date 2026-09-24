# Documentação da API

## 1. Nome da API

SendMail — API de Envio de E-mail

## 2. Método HTTP

`POST`

## 3. Endpoint

`https://api.vibezz.com/api/sendmail`

## 4. Content-Type

`application/json`

## 5. Payload esperado

```json
{
  "to": "paulo@vibezz.com",
  "from_email": "noreply.cineidea@cineidea.com",
  "from_name": "Email do Site Corinthias",
  "assunto": "Este é o título do corpo da mensagem",
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "telefone": "11 43535-0449",
  "mensagem": "Este é um e-mail com template HTML.\nVocê pode clicar no botão abaixo."
}
```

## 6. Campos do payload

| Campo        | Tipo   | Obrigatório/Opcional | Descrição                                          |
|--------------|--------|----------------------|----------------------------------------------------|
| `to`         | string | Não informado        | E-mail do destinatário.                            |
| `from_email` | string | Não informado        | E-mail do remetente.                               |
| `from_name`  | string | Não informado        | Nome exibido como remetente.                       |
| `assunto`    | string | Não informado        | Assunto da mensagem.                               |
| `nome`       | string | Não informado        | Nome do contato.                                   |
| `email`      | string | Não informado        | E-mail do contato.                                 |
| `telefone`   | string | Não informado        | Telefone do contato.                               |
| `mensagem`   | string | Não informado        | Corpo da mensagem. Aceita quebras de linha (`\n`). |

## 7. Exemplo de requisição (cURL)

```bash
curl -X POST "https://api.vibezz.com/api/sendmail" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "paulo@vibezz.com",
    "from_email": "noreply.cineidea@cineidea.com",
    "from_name": "Email do Site Corinthias",
    "assunto": "Este é o título do corpo da mensagem",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "telefone": "11 43535-0449",
    "mensagem": "Este é um e-mail com template HTML.\nVocê pode clicar no botão abaixo."
  }'
```
