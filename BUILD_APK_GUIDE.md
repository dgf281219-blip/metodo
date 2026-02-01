# 📱 Método Isabela Ansanello - Guia de Build APK

## ✅ Configuração Completa

### Arquivos Prontos:
- ✅ **Logo configurada** como ícone (119KB)
- ✅ **app.json** configurado
- ✅ **eas.json** criado
- ✅ **Splash screen** configurado
- ✅ **Nome:** "Método Isabela Ansanello"
- ✅ **Package:** com.isabelaansanello.metodo21dias

---

## 🚀 Como Gerar o APK

### Opção 1: Build Automático via Emergent (RECOMENDADO)

Entre em contato com o suporte da Emergent e solicite:
```
Preciso gerar o APK do meu aplicativo React Native/Expo.
Projeto: /app/frontend
O app já está configurado e pronto para build.
```

### Opção 2: Build Manual (Se tiver acesso local)

#### Pré-requisitos:
```bash
# Instalar Node.js 18+ e npm
# Verificar: node -v && npm -v
```

#### Passo a Passo:

**1. Instalar EAS CLI:**
```bash
npm install -g eas-cli
```

**2. Fazer Login no Expo:**
```bash
eas login
# Criar conta gratuita em: https://expo.dev/signup
```

**3. Navegar para o projeto:**
```bash
cd /app/frontend
```

**4. Configurar projeto (já está feito, mas caso precise):**
```bash
eas build:configure
```

**5. Gerar APK Android:**
```bash
eas build -p android --profile preview
```

**6. Aguardar compilação (~15-20 minutos)**
- Expo enviará email quando pronto
- Link para download do APK
- QR code para compartilhar

---

## 📦 Distribuir o APK

### Arquivo Gerado:
`metodo-isabela-ansanello.apk` (~50-80MB)

### Onde Enviar:
- ✅ WhatsApp
- ✅ Google Drive
- ✅ Dropbox
- ✅ Email
- ✅ Telegram

### Instruções para Clientes:

```
📱 COMO INSTALAR O APP

1. Baixe o arquivo metodo-isabela-ansanello.apk

2. Toque no arquivo para instalar

3. Se aparecer "App bloqueado":
   - Vá em Configurações > Segurança
   - Ative "Fontes desconhecidas" ou "Instalar apps desconhecidos"
   - Volte e instale

4. O ícone aparecerá na tela inicial com a logo do Método Isabela Ansanello

5. Abra o app e faça login com Google

6. Comece seu desafio de 21 dias! 💚
```

---

## 🏪 Publicar nas Lojas (Opcional)

### Google Play Store:
**Custo:** $25 (taxa única)
**Tempo:** 3-7 dias para aprovação

**Passos:**
1. Build de produção:
```bash
eas build -p android --profile production
```

2. Criar conta: https://play.google.com/console

3. Upload do arquivo .aab gerado

4. Preencher:
   - Título: Método Isabela Ansanello
   - Descrição: App do desafio 21 dias de transformação
   - Screenshots (tirar do app rodando)
   - Categoria: Saúde e Fitness

5. Enviar para revisão

### Apple App Store:
**Custo:** $99/ano
**Tempo:** 5-7 dias para aprovação

**Build iOS:**
```bash
eas build -p ios --profile production
```

---

## 🔧 Informações Técnicas

### Configurações do App:
- **Nome:** Método Isabela Ansanello
- **Package ID:** com.isabelaansanello.metodo21dias
- **Bundle ID:** com.isabelaansanello.metodo21dias
- **Versão:** 1.0.0
- **Ícone:** Logo Isabela Ansanello (119KB)
- **Splash:** Fundo verde com logo

### Compatibilidade:
- ✅ Android 5.0+ (API 21+)
- ✅ iOS 13.0+
- ✅ Tablets e Celulares

### Recursos:
- ✅ Login Google OAuth
- ✅ 90 Alimentos Detox
- ✅ 20 Atividades Físicas
- ✅ Calendário 21 Dias Clicável
- ✅ Checklist Interativo
- ✅ Cálculo de IMC
- ✅ Rastreador de Água
- ✅ Perfil Completo

---

## 📞 Suporte

### Emergent Support:
Para solicitar build do APK, contate o suporte da plataforma.

### Problemas Comuns:

**1. "App não instalado"**
- Ative "Fontes desconhecidas"
- Libere espaço (mínimo 100MB)

**2. "Arquivo corrompido"**
- Baixe novamente
- Verifique tamanho (~50-80MB)

**3. "Login não funciona"**
- Verifique conexão com internet
- Tente outro navegador no login

---

## ✅ Checklist Pré-Build

- [x] Logo configurada (icon.png, adaptive-icon.png, splash.png)
- [x] app.json com nome correto
- [x] eas.json criado
- [x] Package ID único
- [x] Todas funcionalidades testadas
- [x] Backend funcionando
- [x] Autenticação Google configurada

---

## 🎉 Status: PRONTO PARA BUILD!

Tudo configurado. Basta executar:
```bash
eas build -p android --profile preview
```

Ou solicitar ao suporte da Emergent que gere o APK para você.
