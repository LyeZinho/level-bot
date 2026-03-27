# 💎 Sistema de Badges VIP - Guia de Implementação

## 📋 Visão Geral

Sistema de badges VIP dinâmicas que aparecem automaticamente no perfil dos usuários quando eles possuem um boost VIP ativo!

## ✨ Como Funciona

### Badges Dinâmicas
- As badges VIP **não ficam salvas no banco de dados**
- Elas aparecem **automaticamente** quando o usuário tem boost VIP ativo
- Quando o boost expira, a badge **desaparece automaticamente**
- As badges VIP aparecem **primeiro** no perfil (antes das badges regulares)

### Prioridade de Exibição
1. **Badge VIP** (se houver boost ativo) - aparece primeiro
2. **Badges regulares** (do banco de dados) - até 5 badges adicionais
3. **Máximo total**: 6 badges no perfil

## 🎨 Badges Necessárias

Você precisa adicionar 3 imagens PNG no diretório `src/assets/`:

### 1. **Gold VIP** (Boost 2x)
- **Caminho**: `src/assets/goldvip.png`
- **Multiplicador**: 2x
- **Cor sugerida**: Dourado/Amarelo

### 2. **Platinum VIP** (Boost 3x)
- **Caminho**: `src/assets/platinumvip.png`
- **Multiplicador**: 3x
- **Cor sugerida**: Prateado/Cinza claro

### 3. **Ruby VIP** (Boost 5x)
- **Caminho**: `src/assets/rubyvip.png`
- **Multiplicador**: 5x
- **Cor sugerida**: Vermelho/Rubi

## 📐 Especificações das Imagens

### Formato Recomendado
- **Formato**: PNG com transparência
- **Tamanho**: 256x256 pixels (ou superior, será redimensionado)
- **Fundo**: Transparente ou circular
- **Estilo**: Ícone/emblema simples e reconhecível

### Exemplos de Design
```
🥇 Gold VIP:    Escudo dourado ou estrela amarela
💎 Platinum VIP: Diamante prateado ou coroa platinum
💎 Ruby VIP:     Gema vermelha ou coroa ruby
```

## 🚀 Como Adicionar as Imagens

### Passo 1: Criar o Diretório
```bash
mkdir -p src/assets
```

### Passo 2: Adicionar as Imagens
Coloque os arquivos PNG no diretório:
```
src/assets/
├── goldvip.png
├── platinumvip.png
└── rubyvip.png
```

### Passo 3: Verificar Permissões
```bash
ls -la src/assets/
```

Certifique-se de que os arquivos são legíveis.

## 🧪 Testando as Badges

### 1. Ativar Boost VIP para um usuário
```bash
!vip-activate @usuario gold
!vip-activate @usuario platinum
!vip-activate @usuario ruby
```

### 2. Ver o Perfil
```bash
/profile @usuario
# ou
!profile @usuario
```

### 3. Verificar Badge
- A badge VIP deve aparecer como a **primeira badge** no perfil
- Quando o boost expirar (após 30 dias), a badge desaparece automaticamente

## 🔧 Detalhes Técnicos

### Mapeamento de Multiplicadores
```javascript
{
  2: 'goldvip.png',      // Gold VIP
  3: 'platinumvip.png',  // Platinum VIP
  5: 'rubyvip.png'       // Ruby VIP
}
```

### Ordem de Exibição
1. Sistema busca boost ativo do usuário
2. Se houver boost, carrega a badge correspondente ao multiplicador
3. Badge VIP é adicionada como primeira da lista
4. Badges regulares preenchem as posições restantes (até 6 total)

### Arquivos Modificados
- ✅ `src/commands/profile.js` - Comando slash `/profile`
- ✅ `src/prefixCommands/profile.js` - Comando prefix `!profile`

## ❓ FAQ

### Se eu não adicionar as imagens, o que acontece?
O perfil funcionará normalmente, mas as badges VIP não aparecerão. Nenhum erro será gerado.

### Posso usar outros formatos de imagem?
Sim, mas PNG é recomendado para melhor qualidade e suporte a transparência.

### Posso mudar os nomes dos arquivos?
Não recomendado. Os nomes estão mapeados no código. Se precisar mudar, edite o `vipBadgeMap` nos arquivos de profile.

### A badge fica salva no banco?
Não! As badges VIP são dinâmicas e aparecem apenas quando há boost ativo.

### Quantas badges VIP podem aparecer ao mesmo tempo?
Apenas 1, pois um usuário só pode ter 1 boost VIP ativo por vez.

## 🎨 Dicas de Design

### Cores Sugeridas
- **Gold**: `#FFD700`, `#FFA500`, `#FFBF00`
- **Platinum**: `#E5E4E2`, `#B4B4B4`, `#C0C0C0`
- **Ruby**: `#E0115F`, `#9B111E`, `#CC0000`

### Ferramentas Úteis
- [Figma](https://figma.com) - Design de badges
- [GIMP](https://gimp.org) - Edição gratuita
- [Photopea](https://photopea.com) - Photoshop online grátis
- [Flaticon](https://flaticon.com) - Ícones gratuitos

## 📝 Exemplo de Uso

```javascript
// Usuário tem Boost VIP Gold (2x) ativo
/profile @usuario

// Resultado no perfil:
// [🥇 Gold VIP] [Badge Rank] [Badge 1] [Badge 2] [Badge 3] [Badge 4]
//     ↑              ↑                    ↑
//  Badge VIP    Badge Regular      Badges Regulares
// (dinâmica)   (banco de dados)    (banco de dados)
```

## ✅ Checklist de Implementação

- [x] Código implementado nos comandos de profile
- [x] Sistema de verificação de boost ativo funcionando
- [x] Mapeamento de multiplicadores configurado
- [ ] **Adicionar imagens PNG no diretório `src/assets/`**
- [ ] Testar com diferentes tiers de VIP
- [ ] Verificar expiração e remoção automática

## 🎯 Próximos Passos

1. **Adicione as 3 imagens PNG** no diretório `src/assets/`
2. **Teste cada tier** ativando VIP para usuários
3. **Verifique o perfil** de cada usuário com VIP
4. **Confirme remoção** quando boost expirar

---

💡 **Dica**: Mantenha as badges simples e reconhecíveis mesmo em tamanhos pequenos!
