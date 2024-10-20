const day = new Date().getDay();
const hour = new Date().getHours();
const minutes = new Date().getMinutes();

const statusRestaurante = document.querySelector(".status-open");
const titleStatus = document.querySelector("span#lojaAberta");
let statusValue = "Fechado";

console.log("day", day);
console.log("hour", hour);
console.log("minutes", minutes);

// Para o horário ser correto precisa ser >= (horario) e no final apenas < (horario)
// Domingo
if (day === 0) {
    if (hour >= 0 && hour < 20) {
        statusRestaurante.classList.remove("closed");
        titleStatus.textContent = "Aberto";
        statusValue = "Aberto";
    } else {
        statusRestaurante.classList.add("closed");
        titleStatus.textContent = "Fechado";
        statusValue = "Fechado";
    }
}

// Segunda à Sexta
if (day >= 1 && day <= 5) {
    if ((hour >= 8 && hour < 12) || (hour >= 14 && hour < 20)) {
        statusRestaurante.classList.remove("closed");
        titleStatus.textContent = "Aberto";
        statusValue = "Aberto";
    } else {
        statusRestaurante.classList.add("closed");
        titleStatus.textContent = "Fechado";
        statusValue = "Fechado";
    }
}

// Sábado
if (day === 6) {
    if (hour >= 7 && hour < 22) {
        statusRestaurante.classList.remove("closed");
        titleStatus.textContent = "Aberto";
        statusValue = "Aberto";
    } else {
        statusRestaurante.classList.add("closed");
        titleStatus.textContent = "Fechado";
        statusValue = "Fechado";
    }
}

$(document).ready(function () {
    cardapio.eventos.init();
});

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;
var CHAVE_PIX = "colocar a chave pix da empresa aqui se desejar";

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;

var CIDADE = "Porto Alegre";
var ESTADO = "RS";

// Variável em float de 49.99
var FRETE_GRATIS = 49.99;

// Variaveis para trocar pelos contatos da empresa
var CELULAR_EMPRESA = "5551993627720";
var LINK_INSTAGRAM = "https://www.instagram.com";
var LINK_TELEGRAM = "https://t.me";
var LINK_FACEBOOK = "https://www.facebook.com";

let startIndex = 0;
let endIndex = 8;

cardapio.eventos = {
    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoLigar();
        cardapio.metodos.carregarBotaoReserva();
        cardapio.metodos.carregarBotaoInstagram();
        cardapio.metodos.carregarBotaoTelegram();
        cardapio.metodos.carregarBotaoFacebook();
        cardapio.metodos.carregarBotaoInstagramFooter();
        cardapio.metodos.carregarBotaoTelegramFooter();
        cardapio.metodos.carregarBotaoFacebookFooter();
        cardapio.metodos.carregarBotaoWhatsappFooter();
        cardapio.metodos.audioRemove();
        cardapio.metodos.audioAdd();
    },
};

cardapio.metodos = {
    // Obtem a lista de itens do cardápio
    obterItensCardapio: (categoria = "burgers", vermais = false) => {
        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itensCardapio").html("");
            $("#btnVerMais").removeClass("hidden");

            startIndex = 0;
            endIndex = 8;
        }

        if (filtro.length === 0) {
            $("#btnVerMais").addClass("hidden");
        }

        $.each(filtro, (i, e) => {
            let temp = cardapio.templates.item
            .replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${descricao}/g, e.dsc)
            .replace(/\${id}/g, e.id)
            .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","));

            // Botão Ver mais foi clicado (Maximo de itens)
            if (vermais && i >= startIndex && i < endIndex) {
                $("#itensCardapio").append(temp);
            }

            // Paginação inicial (8 Itens)
            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp);
            }

            // Caso o total de items do cardapio for 8 ou menos que 8 o botão "Ver mais" não aparece.
            if (filtro.length <= 8 || endIndex === filtro.length || filtro.length < endIndex) {
                $('#btnVerMais').addClass('hidden');
            }

            // A função .length de um array vai pegar a quantidade de elementos Ex: [0, 1, 2].length = 3

            return;
        });

        // Remove o ativo
        $(".container-menu a").removeClass("active");

        // Seta o menu para ativo (Adiciona o ativo para a categoria classe atual)
        $("#menu-" + categoria).addClass("active");
    },

    // Clique no botão de ver mais
    verMais: () => {
        var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];

        if (startIndex === 0) {
            startIndex = 8
            endIndex = 12
        } else {
            startIndex = startIndex + 4
            endIndex = endIndex + 4
        }

        cardapio.metodos.obterItensCardapio(ativo, true);

        // $("#btnVerMais").addClass("hidden");
    },

    // Diminuir a quantidade do item no cardápio
    diminuirQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1);
        }
    },

    // Aumentar a quantidade do item no cardápio
    aumentarQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1);

        if (statusValue === "Fechado") {
            cardapio.metodos.mensagem("Desculpe! No momento estamos fechados.");
            return;
        }

    },

    // Adicionar ao carrinho o item do cardápio
    adicionarAoCarrinho: (id) => {
        if (statusValue === "Fechado") {
            cardapio.metodos.mensagem("Desculpe! No momento estamos fechados.");
            return;
        }

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            // Obter a categoria ativa
            var categoria = $(".container-menu a.active").attr("id").split("menu-")[1];

            // Obtem a lista de itens
            let filtro = MENU[categoria];

            // Obtem o item (Retorna o obj inteiro)
            let item = $.grep(filtro, (e, i) => {
                return e.id == id;
            });

            if (item.length > 0) {
                // Validar se já existe esse item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => {
                    return elem.id == id;
                });

                // Caso já exista o item no carrinho, só altera a quantidade
                if (existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }

                // Caso ainda não exista o item no carrinho, adiciona ele
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0]);
                }

                cardapio.metodos.mensagem("Item adicionado ao carrinho!", "green", "2000");
                $("#qntd-" + id).text(0);
                cardapio.metodos.atualizarBadgeTotal();
            }
        }
    },

    // Atualiza o Badge de totais dos botões "Meu carrinho"
    atualizarBadgeTotal: () => {
        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd;
        });

        if (total > 0) {
            $(".botao-carrinho").removeClass("hidden");
            $(".container-total-carrinho").removeClass("hidden");
        } else {
            $(".botao-carrinho").addClass("hidden");
            $(".container-total-carrinho").addClass("hidden");
        }

        $(".badge-total-carrinho").html(total);
    },

    // Abrir a modal de carrinho e fecha as opções do menu após clicado no mobile
    abrirCarrinho: (abrir) => {
        // console.log(abrir);
        if (statusValue === "Fechado") {
            cardapio.metodos.mensagem("Desculpe! No momento estamos fechados.");
            return;
        }

        // document.querySelector('.collapse').classList.remove('show');
        if (abrir) {
            $("#modalCarrinho").removeClass("hidden");
            cardapio.metodos.carregarCarrinho();
            $(".whatsapp-btn").addClass("hidden");
        } else {
            $("#modalCarrinho").addClass("hidden");
            $(".whatsapp-btn").removeClass("hidden");
        }

        // Se a cliente clicar em fechar no carrinho atualiza para a etapa 1 (carregarCarrinho faz pular para etapa 1)
        cardapio.metodos.carregarCarrinho();
        $("#lblValorEntrega").removeClass("gratis");

        let trocoSim = document.querySelector("input#troco-sim");
        let trocoNao = document.querySelector("input#troco-nao");
        let inputTroco = document.querySelector(".trocoSimOuNao");
        let esconderInputTroco = document.querySelector(".trocoValue");
        let inputRetirada = document.querySelector("input#retirada");
        let inputDelivery = document.querySelector("input#delivery");
        let dinheiro = document.querySelector("input#dinheiro");
        let pix = document.querySelector("input#pix");
        let credito = document.querySelector("input#credito");
        let debito = document.querySelector("input#debito");
        let troco = document.querySelector("#numberTroco");

        inputRetirada.checked = false;
        inputDelivery.checked = false;
        dinheiro.checked = false;
        pix.checked = false;
        credito.checked = false;
        debito.checked = false;
        trocoSim.checked = false;
        trocoNao.checked = false;
        inputTroco.style.display = "none";
        esconderInputTroco.style.display = "none";
        troco.value = "";

    },

    // Fechando o Menu
    // fecharMenu: (abrir) => {
    //     // document.querySelector('.collapse').classList.remove('show');
    // },

    // Altera os textos e exibe os botões das etapas
    carregarEtapa: (etapa) => {
        if (etapa == 1) {
            $("#lblTituloEtapa").text("Seu carrinho:");
            $("#itensCarrinho").removeClass("hidden");
            $("#retiradaPedido").addClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").addClass("hidden");
            $("#formaPgto").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");

            $("#btnEtapaPedido").removeClass("hidden");
            $("#btnEtapaRetirada").addClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").addClass("hidden");
        }

        if (etapa == 2) {
            $("#lblTituloEtapa").text("Retirada ou Delivery:");
            $("#itensCarrinho").addClass("hidden");
            $("#retiradaPedido").removeClass("hidden");
            $("#formaPgto").addClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");

            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaRetirada").removeClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").removeClass("hidden");
        }

        if (etapa == 3) {
            const inputRetirada = document.querySelector("input#retirada");

            if (inputRetirada.checked) {
                $("#lblTituloEtapa").text("Informe seu nome para Retirada:");
                $("#retirarPedido").html('Nome de quem vai Retirar o pedido:');
                $(".cidade-endereco").html('');
                $("#textoEntrega").html('');
            } else {
                $("#lblTituloEtapa").html('<span class="formas-text">Formas de pagamento: </span><img class="formas-pagamento-js animated bounceIn" src="./img/formas-pagamento.png" />');
            }

            $("#itensCarrinho").addClass("hidden");
            $("#retiradaPedido").addClass("hidden");
            $("#formaPgto").removeClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");
            $(".etapa3").addClass("active");

            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaRetirada").addClass("hidden");
            $("#btnEtapaEndereco").removeClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").removeClass("hidden");
        }

        if (etapa == 4) {
            $("#lblTituloEtapa").text("Resumo do pedido:");
            $("#itensCarrinho").addClass("hidden");
            $("#retiradaPedido").addClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").removeClass("hidden");
            $("#formaPgto").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");
            $(".etapa3").addClass("active");
            $(".etapa4").addClass("active");

            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaRetirada").addClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").removeClass("hidden");
            $("#btnVoltar").removeClass("hidden");
        }
    },

    // Botão de voltar a etapa
    voltarEtapa: () => {
        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);
        cardapio.metodos.carregarCarrinho();

        $("#lblValorEntrega").removeClass("gratis");

        let inputTroco = document.querySelector(".trocoSimOuNao");
        let inputRetirada = document.querySelector("input#retirada");
        let inputDelivery = document.querySelector("input#delivery");
        let dinheiro = document.querySelector("input#dinheiro");
        let pix = document.querySelector("input#pix");
        let credito = document.querySelector("input#credito");
        let debito = document.querySelector("input#debito");
        let troco = document.querySelector("#numberTroco");

        inputRetirada.checked = false;
        inputDelivery.checked = false;
        dinheiro.checked = false;
        pix.checked = false;
        credito.checked = false;
        debito.checked = false;
        inputTroco.style.display = "none";
        troco.value = "";

    },

    // Carrega a lista de itens do carrinho
    carregarCarrinho: () => {
        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {
            $("#itensCarrinho").html("");

            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemCarrinho
                    .replace(/\${img}/g, e.img)
                    .replace(/\${nome}/g, e.name)
                    .replace(/\${id}/g, e.id)
                    .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
                    .replace(/\${qntd}/g, e.qntd);

                $("#itensCarrinho").append(temp);

                // Últino item
                if (i + 1 == MEU_CARRINHO.length) {
                    cardapio.metodos.carregarValores();
                }
            });
        } else {
            $("#itensCarrinho")
            .html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i><b> Seu carrinho está vazio!</b></p>');
            cardapio.metodos.carregarValores();
        }
    },

    // Diminui a quantidade do item da modal carrinho
    diminuirQuantidadeCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if (qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        } else {
            cardapio.metodos.removerItemCarrinho(id);
        }
    },

    // Aumenta a quantidade do item da modal carrinho
    aumentarQuantidadeCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
    },

    // Botão Remove a quantidade do item da modal carrinho
    removerItemCarrinho: (id) => {
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {
            cardapio.metodos.audioRemove();
            return e.id != id;
        });
        $("#lblValorEntrega").removeClass("gratis");
        cardapio.metodos.carregarCarrinho();

        // Atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();
    },

    // Atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id, qntd) => {
        let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
        MEU_CARRINHO[objIndex].qntd = qntd;

        // Atualiza o botão carrinho com a quantidade atualizada
        cardapio.metodos.atualizarBadgeTotal();

        // Atualiza os valores em (R$) totais do carrinho
        cardapio.metodos.carregarValores();
    },

    // Carrega os valores de subTotal, Entrega e total
    carregarValores: () => {
        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text("R$ 0,00");
        $("#lblValorEntrega").text("+ R$ 0,00");
        $("#lblValorTotal").text("R$ 0,00");

        $.each(MEU_CARRINHO, (i, e) => {
            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            if (i + 1 == MEU_CARRINHO.length) {
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}`);
            }
        });
    },

    // Carregar a etapa endereços
    carregarEndereco: () => {
        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem("Seu carrinho está vazio.");
            return;
        }

        const inputRetirada = document.querySelector("input#retirada");
        const inputDelivery = document.querySelector("input#delivery");

        if (!inputDelivery.checked && !inputRetirada.checked) {
            cardapio.metodos.mensagem("Selecione uma opção, por favor!");
            return;
        }

        if (inputRetirada.checked) {
            $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`);

            // Classe para adicionar um line-through
            $("#lblValorEntrega").addClass("gratis");

            cardapio.metodos.audioAdd();

            // O valor total será simplesmente o valor do carrinho
            $("#lblValorTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`);

            document.querySelector("div.all-pgto").style.display = "none";

            cardapio.metodos.carregarEtapa(3);
            cardapio.metodos.mensagem("Pagamento será na Retirada!", "yellow", "2500");
            cardapio.metodos.carregarResumo();
            $("#nomeCliente").focus();
            return;
        }

        if (inputDelivery.checked) {
            let cep = $("#txtCEP").val().trim();
            let endereco = $("#txtEndereco").val().trim();
            let bairro = $("#txtBairro").val().trim();
            let cidade = $("#txtCidade").val().trim();
            let uf = $("#ddlUF").val().trim();
            let numero = $("#txtNumero").val().trim();
            let complemento = $("#txtComplemento").val().trim();

            document.querySelector("div.all-pgto").style.display = "flex";
            document.querySelector("#nomeDoClientePagamento").style.display = "none";
            document.querySelector("#observacaoCliente").style.display = "none";

            if (cep.length <= 0) {
                cardapio.metodos.mensagem("Informe o CEP, por favor!");
                $("#txtCEP").focus();
                return;
            }

            if (endereco.length <= 0) {
                cardapio.metodos.mensagem("Informe o Endereço, por favor!");
                $("#txtEndereco").focus();
                return;
            }

            if (bairro.length <= 0) {
                cardapio.metodos.mensagem("Informe o Bairro, por favor!");
                $("#txtBairro").focus();
                return;
            }

            if (cidade.length <= 0) {
                cardapio.metodos.mensagem("Informe a Cidade, por favor!");
                $("#txtCidade").focus();
                return;
            }

            if (uf == "-1") {
                cardapio.metodos.mensagem("Informe a UF, por favor!");
                $("#ddlUF").focus();
                return;
            }

            if (numero.length <= 0) {
                cardapio.metodos.mensagem("Informe o Número, por favor!");
                $("#txtNumero").focus();
                return;
            }

            if (VALOR_CARRINHO >= FRETE_GRATIS && cidade.toUpperCase() === CIDADE.toUpperCase() &&
                uf.toUpperCase() === ESTADO.toUpperCase()) {
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`);

                // Classe para adicionar um line-through
                $("#lblValorEntrega").addClass("gratis");

                cardapio.metodos.audioAdd();

                // O valor total será simplesmente o valor do carrinho
                $("#lblValorTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`);

                // Se for FRETE GRATIS
                cardapio.metodos.mensagem("Frete Grátis, parabéns!", "yellow", "2500");

            } else {
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`);

                // Classe para adicionar um line-through
                $("#lblValorEntrega").removeClass("gratis");

                // O valor total será simplesmente o valor do carrinho
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}`);

            }

            cardapio.metodos.carregarEtapa(3);
            return;
        }

        cardapio.metodos.mensagem("Erro ao processar opção de entrega.");
    },

    // Carrega a retirada
    carregarRetirada: () => {
        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem("Seu carrinho está vazio.");
            return;
        }

        cardapio.metodos.carregarEtapa(2);
    },

    // Busca o cep após clicar no Enter
    inputCep: () => {
        var cep = $("#txtCEP").val();

        if (cep) {
            cardapio.metodos.buscarCep();
        }
    },

    // Avança para a próxima etapa após clicar no Enter
    inputNome: () => {
        var nome = $("#nomeCliente").val();

        if (nome) {
            $("#msgCliente").focus();
        }
    },

    // Avança para a próxima etapa após clicar no Enter
    inputNumero: () => {
        var numero = $("#txtNumero").val();

        if (numero) {
            cardapio.metodos.carregarEndereco();
        }
    },

    // Avança para a etapa Final após clicar no Enter
    inputTroco: () => {
        var troco = $("#numberTroco").val();

        if (troco) {
            $("#nomeCliente").focus();
        }
    },

    // API ViaCep
    buscarCep: () => {
        // Cria a variavel com o valor do CEP
        var cep = $("#txtCEP").val().trim().replace(/\D/g, "");

        // Verifica se o CEP possui o valor informado
        if (cep != "") {
            // Expressão regular para validar CEP (Regex)
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)) {
                $.getJSON(
                    "https://viacep.com.br/ws/" + cep + "/json/?callback=?",
                    function (dados) {
                        if (!("erro" in dados)) {
                            // Atualizar os campos com os valores retornados
                            $("#txtEndereco").val(dados.logradouro);
                            $("#txtBairro").val(dados.bairro);
                            $("#txtCidade").val(dados.localidade);
                            $("#ddlUF").val(dados.uf);
                            $("#txtNumero").focus();
                        } else {
                            cardapio.metodos.mensagem(
                                "CEP não encontrado. Preencha as informações manualmente."
                            );
                            $("#txtEndereco").focus();
                        }
                    }
                );
            } else {
                cardapio.metodos.mensagem("Formato do CEP inválido.");
                $("#txtCEP").focus();
            }
        } else {
            cardapio.metodos.mensagem("Informe o CEP, por favor!");
            $("#txtCEP").focus();
        }
    },

    // Validação antes de prosseguir para a etapa 4
    resumoPedido: () => {
        let nome = document.querySelector("input#nomeCliente");

        const inputDelivery = document.querySelector("input#delivery");
        const trocoInput = document.querySelector("input#numberTroco");
        const trocoSim = document.querySelector("input#troco-sim");
        const trocoNao = document.querySelector("input#troco-nao");

        const dinheiro = document.querySelector("input#dinheiro");
        const pix = document.querySelector("input#pix");
        const credito = document.querySelector("input#credito");
        const debito = document.querySelector("input#debito");

        if (inputDelivery.checked && !pix.checked && !dinheiro.checked && !credito.checked && !debito.checked) {
            cardapio.metodos.mensagem("Qual a forma de pagamento?");
            return;
        }

        if (dinheiro.checked && !trocoSim.checked && !trocoNao.checked) {
            cardapio.metodos.mensagem("Selecione se precisa de troco.");
            return;
        }

        if (inputDelivery.checked && trocoSim.checked && dinheiro.checked &&
            (!trocoInput.value || trocoInput.value.length <= 0)) {
            cardapio.metodos.mensagem("Digite o valor do troco.");
            $("#numberTroco").focus();
            return;
        }

        if (!nome.value || nome.value.length <= 0) {
            cardapio.metodos.mensagem("Digite seu nome e sobrenome.");
            $("#nomeCliente").focus();
            return;
        }

        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUF").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento,
        };

        cardapio.metodos.carregarEtapa(4);
        cardapio.metodos.carregarResumo();
    },

    // Carrega a etapa de resumo do pedido
    carregarResumo: () => {
        $("#listaItensResumo").html("");

        $.each(MEU_CARRINHO, (i, e) => {
            let temp = cardapio.templates.itemResumo
                .replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
                .replace(/\${qntd}/g, e.qntd);

            $("#listaItensResumo").append(temp);
        });

        let nomeCliente = $("#nomeCliente").val().trim();

        $("#nomeDoCliente").html(`${nomeCliente}`);

        const inputRetirada = document.querySelector("input#retirada");

        if (inputRetirada.checked) {
            $("#resumoEndereco").html(`Retirada no estabelecimento!`);
            $("#formaPagamentoSelecionada").html('Pagamento será realizado no estabelecimento!');
            cardapio.metodos.finalizarPedido();
            return;
        }

        // Mostra o endereço completo dinamicamente
        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        let inputDelivery = document.querySelector("input#delivery")
        let pix = document.querySelector("input#pix");
        let credito = document.querySelector("input#credito");
        let debito = document.querySelector("input#debito");
        let dinheiro = document.querySelector("input#dinheiro");

        if (inputDelivery.checked) {
            if (dinheiro.checked) {
                $("#formaPagamentoSelecionada").html(`Dinheiro`);
                $("#textoEntrega").html(`Pagamento será realizado na Entrega!`);
            }

            if (pix.checked) {
                $("#formaPagamentoSelecionada").html(`Pix`);
                $("#textoEntrega").html(`Pagamento será realizado na Entrega!`);
            }

            if (credito.checked) {
                $("#formaPagamentoSelecionada").html(`Crédito`);
                $("#textoEntrega").html(`Pagamento será realizado na Entrega!`);
            }

            if (debito.checked) {
                $("#formaPagamentoSelecionada").html(`Débito`);
                $("#textoEntrega").html(`Pagamento será realizado na Entrega!`);
            }
        }

        cardapio.metodos.finalizarPedido();
    },

    // Atualiza o link do botão do WhatsApp (Mensagem dos pedidos escolhidos para o WhatsApp)
    finalizarPedido: () => {
        const inputRetirada = document.querySelector("input#retirada");
        const inputDelivery = document.querySelector("input#delivery");

        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null && inputDelivery.checked) {
            let cidade = $("#txtCidade").val().trim();
            let uf = $("#ddlUF").val().trim();
            let nomeCliente = $("#nomeCliente").val().trim();
            let observacao = $("#msgCliente").val().trim();

            var texto = "Olá, gostaria de fazer um pedido:";
            texto += '\n\n*Itens do pedido:*\n\${itens}';
            texto += "\n*Endereço de entrega:*";

            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;

            texto += `\n\n*Nome do cliente:* ${nomeCliente}`;

            if (observacao == null || observacao == '') {
                texto += `\n\n*Observações:* \nSem observações!`;
            } else {
                texto += `\n\n*Observações:* \n${observacao}`;
            }

            const pix = document.querySelector("input#pix");
            const credito = document.querySelector("input#credito");
            const debito = document.querySelector("input#debito");
            const dinheiro = document.querySelector("input#dinheiro");
            const trocoSim = document.querySelector("input#troco-sim");
            const troco = document.querySelector("input#numberTroco");

            texto += "\n\n*Forma de Pagamento:*";

            if (dinheiro.checked) {
                texto += "\n*Dinheiro*";

                if (trocoSim.checked) {
                    texto += "\n*Precisa de troco?* -  SIM";
                    texto += `\n*Troco para:* R$ ${troco.value}`;
                } else {
                    texto += "\n*Precisa de troco?* -  NÃO";
                }
            }

            if (pix.checked) {
                texto += "\n*Pix*";
                // texto += `\n*Chave Pix:* ${CHAVE_PIX}`;
            }

            if (credito.checked) {
                texto += "\n*Cartão de Crédito*";
                texto += "\nLevar maquininha";
            }

            if (debito.checked) {
                texto += "\n*Cartão de Débito*";
                texto += "\nLevar maquininha";
            }

            if (VALOR_CARRINHO >= FRETE_GRATIS && cidade.toUpperCase() === CIDADE.toUpperCase() && uf.toUpperCase() ===  ESTADO.toUpperCase()) {
                texto += `\n\n*Total (com entrega): R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}*`;
            } else {
                texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}*`;
            }

            var itens = "";

            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}x* ${e.name} ... R$ ${e.price.toFixed(2).replace(".", ",")} \n`;

                // Último item
                if (i + 1 == MEU_CARRINHO.length) {
                    texto = texto.replace(/\${itens}/g, itens);

                    // Converte a URL (Encode)
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEtapaResumo").attr("href", URL);
                }
            });
            return;
        }

        if (MEU_CARRINHO.length > 0 && inputRetirada.checked) {
            let nomeCliente = $("#nomeCliente").val().trim();
            let observacao = $("#msgCliente").val().trim();

            var texto = "Olá, gostaria de fazer um pedido:";
            texto += '\n\n*Itens do pedido:*\n\${itens}';

            texto += "\n*Endereço de entrega:*";
            texto += `\nRETIRADA NO ESTABELECIMENTO`;

            texto += `\n\n*Nome do cliente:* ${nomeCliente}`;

            if (observacao == null || observacao == '') {
                texto += `\n\n*Observações:* \nSem observações!`;
            } else {
                texto += `\n\n*Observações:* \n${observacao}`;
            }

            texto += "\n\n*Forma de Pagamento:*";
            texto += "\nO pagamento será efetuado no estabelecimento.";

            texto += `\n\n*Total: R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}*`;

            var itens = "";

            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}x* ${e.name} ... R$ ${e.price.toFixed(2).replace(".", ",")} \n`;

                // Último item
                if (i + 1 == MEU_CARRINHO.length) {
                    texto = texto.replace(/\${itens}/g, itens);

                    // Converte a URL (Encode)
                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEtapaResumo").attr("href", URL);
                }
            });
            return;
        }

    },

    // Carregar o link do botão reserva
    carregarBotaoReserva: () => {
        var texto = "Olá! gostaria de fazer uma *Reserva*.";

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnReserva").attr("href", URL);
    },

    // Carrega o botão do WhatsApp
    carregarBotaoWhatsappFooter: () => {
        var texto = "Olá! Gostaria de saber se o estabelecimento está aberto?";

        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnWhatsapp").attr("href", URL);
    },

    // Carrega o botão de ligar
    carregarBotaoLigar: () => {
        $("#btnLigar").attr("href", `tel:${CELULAR_EMPRESA}`);
    },

    // Carrega o botão do Instagram
    carregarBotaoInstagram: () => {
        $("#btnInstagram").attr("href", `${LINK_INSTAGRAM}`);
    },

    // Carrega o botão do Instagram footer
    carregarBotaoInstagramFooter: () => {
        $("#btnInstagramFooter").attr("href", `${LINK_INSTAGRAM}`);
    },

    // Carrega o botão do Telegram
    carregarBotaoTelegram: () => {
        $("#btnTelegram").attr("href", `${LINK_TELEGRAM}`);
    },

    // Carrega o botão do Telegram footer
    carregarBotaoTelegramFooter: () => {
        $("#btnTelegramFooter").attr("href", `${LINK_TELEGRAM}`);
    },

    // Carrega o botão do Facebook
    carregarBotaoFacebook: () => {
        $("#btnFacebook").attr("href", `${LINK_FACEBOOK}`);
    },

    // Carrega o botão do Facebook footer
    carregarBotaoFacebookFooter: () => {
        $("#btnFacebookFooter").attr("href", `${LINK_FACEBOOK}`);
    },

    // Carrega o botão dos depoimentos 1,2 e 3
    abrirDepoimento: (depoimento) => {
        $("#depoimento-1").addClass("hidden");
        $("#depoimento-2").addClass("hidden");
        $("#depoimento-3").addClass("hidden");

        $("#btnDepoimento-1").removeClass("active");
        $("#btnDepoimento-2").removeClass("active");
        $("#btnDepoimento-3").removeClass("active");

        $("#depoimento-" + depoimento).removeClass("hidden");
        $("#btnDepoimento-" + depoimento).addClass("active");
    },

    // Cria a mensagem de quando adiciona algo no carrinho
    mensagem: (texto, cor = "red", tempo = 3500) => {
        let container = document.querySelector("#container-mensagens");
        if (container.childElementCount === 2) {
            return;
        }

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass("fadeInDown");
            $("#msg-" + id).addClass("fadeOutUp");
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo);
    },

    audioAdd: () => {
        const add = new Audio('./audio/add.mp3')
        add.play();
        add.volume = 0.2;
    },

    audioRemove: () => {
        const remove = new Audio('./audio/remove.mp3')
        remove.play();
        remove.volume = 0.1;
    },

};


// Troca o botão hamburguer pelo X no mobile quando clicado
const btn = document.querySelector(".navbar-toggler");
const iconBtn = document.querySelector(".icon-btn");
const navLinks = document.querySelector(".navbar-collapse");

var menuIsOpen = false;

function MenuIsOpen() {
    if (menuIsOpen) {
        iconBtn.classList = "fas fa-times icon-btn";
        navLinks.classList.add("show");
        return;
    }

    iconBtn.classList = "fas fa-bars icon-btn";
    navLinks.classList.remove("show");
}

MenuIsOpen();

function toggleMenu() {
    menuIsOpen = !menuIsOpen;
    MenuIsOpen();
}

function closeMenu() {
    menuIsOpen = false;
    MenuIsOpen();
}

// Função para detectar clique fora do menu
document.addEventListener("click", function (event) {
    if (
        menuIsOpen &&
        !navLinks.contains(event.target) &&
        !btn.contains(event.target) &&
        !iconBtn.contains(event.target)
    ) {
        menuIsOpen = false;
        MenuIsOpen();
    }
});


// Muda o texto de Fechar para X (times) no mobile
const changeToBtn = document.querySelector('.float-right');

if (window.innerWidth <= '575'){
    changeToBtn.innerHTML = '<i class="fas fa-times"></i>';
}


// adiciona um evento
const addEventOnElem = function (elem, type, callback) {
    if (elem.length > 1) {
        for (let i = 0; i < elem.length; i++) {
            elem[i].addEventListener(type, callback);
        }
    }
    else {
        elem.addEventListener(type, callback);
    }
};

// Mostra o WhatsApp após scroll de 100px
const whatsapp = document.querySelector(".whatsapp-btn");

const whatsappShow = function () {
    if (window.scrollY > 100) {
        whatsapp.classList.add("active");
    } else {
        whatsapp.classList.remove("active");
    }
};

addEventOnElem(window, "scroll", whatsappShow);


cardapio.templates = {
    item: `
	    <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 wow fadeInUp delay-02s">
            <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <p class="title-produto text-center mt-4">
                <b>\${nome}</b>
            </p>
            <p class="produto-description text-center mt-0">
                \${descricao}
            </p>
            <p class="price-produto text-center">
                <b>R$ \${preco}</b>
            </p>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-\${id}">0</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
            </div>
            </div>
        </div>
	`,

    itemCarrinho: `
	    <div class="col-12 item-carrinho animated fadeInLeft delay-01s">
			<div class="img-produto">
				<img src="\${img}" />
			</div>
			<div class="dados-produto">
				<p class="title-produto"><b>\${nome}</b></p>
				<p class="price-produto"><b>R$ \${preco}</b></p>
			</div>
			<div class="add-carrinho">
			  <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
			  <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
			  <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
				<span class="btn btn-remove" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-trash-alt"></i></span>
			</div>
		</div>
	`,

    itemResumo: `
        <div class="col-12 item-carrinho resumo animated fadeInLeft delay-01s">
			<div class="img-produto-resumo">
				<img src="\${img}"/>
			</div>
			<div class="dados-produto">
				<p class="title-produto-resumo">
					<b>\${nome}</b>
				</p>
				<p class="price-produto-resumo">
				  <b>R$ \${preco}</b>
				</p>
			</div>
			<p class="quantidade-produto-resumo">
				x <b>\${qntd}</b>
			</p>
		</div>
    `,
};


const opRetirada = document.querySelectorAll('input[name="retirada-input"]');
const localEntrega = document.querySelector("div#localEntrega");

localEntrega.style.display = "none";
localEntrega.classList.add("hidden");

opRetirada.forEach((radio) => {
    radio.addEventListener("change", () => {
        if (radio.checked && radio.id === "delivery") {

            localEntrega.style.display = "flex";
            localEntrega.classList.remove("hidden");
            document.querySelector('#txtCEP').focus();
            return;
        }

        localEntrega.style.display = "none";
        localEntrega.classList.add("hidden");

        if (radio.checked && radio.id === "retirada") {
            cardapio.metodos.carregarEndereco();
            return;
        }

    });
});

// ESVAZIAR CARRINHO QUANDO FAZER O PEDIDO
document.querySelector("#btnEtapaResumo").addEventListener("click", () => {
    document.querySelector("#modalCarrinho").classList.add("hidden");
    MEU_CARRINHO = [];
    VALOR_CARRINHO = 0;
    VALOR_ENTREGA = 5;

    let dinheiro = document.querySelector("input#dinheiro");
    let pix = document.querySelector("input#pix");
    let credito = document.querySelector("input#credito");
    let debito = document.querySelector("input#debito");

    let inputRetirada = document.querySelector("input#retirada");
    let inputDelivery = document.querySelector("input#delivery");
    let trocoSim = document.querySelector("input#troco-sim");
    let trocoNao = document.querySelector("input#troco-nao");
    let inputTroco = document.querySelector(".trocoSimOuNao");
    let esconderInputTroco = document.querySelector(".trocoValue");

    let nome = document.querySelector("input#nomeCliente");
    let troco = document.querySelector("#numberTroco");
    let cep = document.querySelector("#txtCEP");
    let endereco = document.querySelector("#txtEndereco");
    let bairro = document.querySelector("#txtBairro");
    let cidade = document.querySelector("#txtCidade");
    let uf = document.querySelector("#ddlUF");
    let numero = document.querySelector("#txtNumero");
    let complemento = document.querySelector("#txtComplemento");

    dinheiro.checked = false;
    pix.checked = false;
    credito.checked = false;
    debito.checked = false;
    inputRetirada.checked = false;
    inputDelivery.checked = false;
    trocoSim.checked = false;
    trocoNao.checked = false;

    nome.value = "";
    troco.value = "";
    cep.value = "";
    endereco.value = "";
    bairro.value = "";
    cidade.value = "";
    uf.value = "";
    numero.value = "";
    complemento.value = "";

    inputTroco.style.display = "none";
    esconderInputTroco.style.display = "none";

    cardapio.metodos.carregarValores();
    cardapio.metodos.carregarResumo();
    cardapio.metodos.atualizarBadgeTotal();
    cardapio.metodos.carregarEtapa(1);
    $("#lblValorEntrega").removeClass("gratis");

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 5000);

});


const troco = document.querySelectorAll('input[name="troco"]');
const inputTroco = document.querySelector("div.trocoValue");

inputTroco.style.display = "none";

troco.forEach((radio) => {
    radio.addEventListener("change", () => {
        if (radio.checked && radio.id === "troco-sim") {
            inputTroco.style.display = "flex";
            document.querySelector("#numberTroco").focus();
            return;
        }

        inputTroco.style.display = "none";

        if (radio.checked && radio.id === "troco-nao") {
            $("#nomeCliente").focus();
            return;
        }

    });
});

document.querySelector("input#numberTroco").addEventListener("change", () => {
    cardapio.metodos.finalizarPedido();
});

const trocoSimOuNao = document.querySelector("div.trocoSimOuNao");
const dinheiroLabel = document.querySelector("label.labelDinheiro");
const pixLabel = document.querySelector("label.labelPix");
const creditoLabel = document.querySelector("label.labelCredito");
const debitoLabel = document.querySelector("label.labelDebito");
const nomeDoClientePagamento = document.querySelector("#nomeDoClientePagamento");
const observacao = document.querySelector("#observacaoCliente");

const dinheiro = document.querySelector("input#dinheiro");
const pix = document.querySelector("input#pix");
const credito = document.querySelector("input#credito");
const debito = document.querySelector("input#debito");

trocoSimOuNao.style.display = "none";

dinheiroLabel.addEventListener("click", () => {
    if (!dinheiro.checked) {
        trocoSimOuNao.style.display = "flex";
        nomeDoClientePagamento.style.display = "flex";
        observacao.style.display = "flex";
    } else {
        trocoSimOuNao.style.display = "none";
    }
});

pixLabel.addEventListener("click", () => {
    if (!pix.checked) {
        nomeDoClientePagamento.style.display = "flex";
        $("#nomeCliente").focus();
        observacao.style.display = "flex";
    }
});

creditoLabel.addEventListener("click", () => {
    if (!credito.checked) {
        nomeDoClientePagamento.style.display = "flex";
        $("#nomeCliente").focus();
        observacao.style.display = "flex";
    }
});

debitoLabel.addEventListener("click", () => {
    if (!debito.checked) {
        nomeDoClientePagamento.style.display = "flex";
        $("#nomeCliente").focus();
        observacao.style.display = "flex";
    }
});
