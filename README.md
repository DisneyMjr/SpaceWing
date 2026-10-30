# Space Wing 2.0 · Galáxia

Jogo Android offline-first com motor JavaScript/Canvas em WebView e anúncios Google Mobile Ads. O projeto é uma evolução da versão 1.1.

## O que foi implementado

- Nave animada: inclinação, impulso, exaustão e partículas.
- Obstáculos: quatro variantes visuais (tubos, energia laranja, tubos oscilantes, laser vermelho). Os estilos compartilham a base de sprites e geometria segura de colisão.
- Quatro cenários espaciais dinâmicos em função da pontuação.
- Novo menu inicial, tela de fim de jogo e navegação por toque.
- Sons sintetizados com Web Audio, independentes de arquivos externos.
- Garagem de 10 naves, com diferenças de coloração e naves desbloqueadas por cristais. Não são 10 sprites independentes.
- Cristais colecionáveis, saldo persistido, três tipos de poderes (escudo, câmera lenta e ímã).
- Três missões diárias com resgate de recompensas e seis conquistas automáticas.
- Evento semanal local baseado em melhor pontuação; reinicia a cada semana.
- Ranking online **opcional**, com API PHP/MySQL de exemplo para hospedagem própria. Sem backend configurado, a tela indica indisponibilidade. O backend demonstrativo não verifica resultados de forma autoritativa; não serve para ranking competitivo público sem controles adicionais.
- Segunda chance opcional com anúncio recompensado: concedida somente quando a SDK confirmar a recompensa.
- Banner e intersticial originais preservados; teste e produção separados.

## Gerar APK

Envie o conteúdo desta pasta para a raiz do repositório `DisneyMjr/SpaceWing`. O GitHub Actions `.github/workflows/android-apk.yml` gera o APK de depuração com IDs de anúncios de teste. Abra Actions > Gerar APK Space Wing > Artifacts.

Para linha de comando em ambiente com JDK 17, Android SDK 35 e Gradle 8.11.1:

```
gradle --no-daemon :app:assembleDebug
```

APK: `app/build/outputs/apk/debug/app-debug.apk`.

**Observação:** esta entrega não inclui APK compilado ou AAB assinado. São necessárias compilação, instalação e testes físicos.

## AdMob

- Aplicativo de produção: `ca-app-pub-5016396775817197~7100442927`
- Banner de produção: `ca-app-pub-5016396775817197/5595789569`
- Intersticial de produção: `ca-app-pub-5016396775817197/5100965541`
- Anúncio recompensado: ID de teste oficial usado **também em release como marcador temporário**, até você criar e fornecer um bloco recompensado próprio. **Substitua antes de publicar.**
- Em debug, todos os IDs são oficiais de teste.
- O app integra a API UMP para consentimento, mas ainda requer revisão da mensagem de consentimento, política de privacidade, avaliações de privacidade e configuração do painel AdMob antes da publicação.

## Ativar ranking no cPanel

1. Crie um banco de dados MySQL e usuário com permissão de leitura e escrita.
2. Execute `servidor-ranking/schema.sql` no phpMyAdmin.
3. Envie `servidor-ranking/api.php` e uma cópia de `config.example.php` com nome `config.php` para uma pasta HTTPS no seu cPanel.
4. Preencha `dsn`, `user`, `password` e `salt` no `config.php`. **Proteja o arquivo config.php do acesso web** ou coloque a configuração fora da pasta pública e altere o caminho no `api.php`.
5. Edite `app/src/main/assets/ranking-config.js`, colocando a URL HTTPS completa para `api.php`.
6. Recompile o APK.

Este ranking é experimental: os envios são feitos pelo cliente, portanto **podem ser falsificados**. Antes de oferecer um ranking público com prêmios ou competição, é preciso implementar autenticação, validação de partidas no servidor, proteção contra abuso e moderação de nomes. Não use pontuação enviada pelo cliente como prova de desempenho.

## Comandos de atualização

```
git add .
git commit -m "Space Wing 2.0: garagem, missões e poderes"
git pull --rebase origin main
git push origin main
```

Não execute `git push --force`.


## Versão 2.2
- Novo ícone da nave, inclusive round e adaptive.
- PNGs retrabalhados para minimizar fundos retangulares.
- Música ambiente original em `app/src/main/assets/audio/trilha_espacial_original.wav` iniciada no primeiro toque, sincronizada com o botão de som e pausada ao sair do aplicativo.
- `versionCode 5`, `versionName 2.2.0`.
- AdMob de teste no APK debug e IDs próprios no release, exceto rewarded ainda de teste.
- Testar no Android após compilar pelo GitHub Actions.
