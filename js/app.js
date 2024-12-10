// Modelo para representar cada produto
const Produto = Backbone.Model.extend({
  defaults: {
    nome: '',
    preco: 0.0,
    descricao: '',
    imagem: '', // Caminho para a imagem do produto
  },
});

// Coleção para armazenar os produtos
const Produtos = Backbone.Collection.extend({
  model: Produto,
});

// Instância da coleção com produtos pré-definidos
const produtos = new Produtos([
  {
    nome: 'Nokia tijolão',
    preco: 5000.00,
    descricao: 'Celular Nokia tijoão',
    imagem: 'nokia.jpg',
  },
  {
    nome: 'Notebok Positivo',
    preco: 399.99,
    descricao: 'Nootebook Positivo',
    imagem: 'positivo.jpg',
  },
  {
    nome: 'Picareta do minecraft',
    preco: 150.00,
    descricao: 'Picareta do minecraft',
    imagem: 'picareta.webp',
  },
]);

// Modelo para representar itens no carrinho
const CarrinhoItem = Backbone.Model.extend({
  defaults: {
    quantidade: 1,
  },
  incrementarQuantidade() {
    this.set('quantidade', this.get('quantidade') + 1);
  },
  decrementarQuantidade() {
    const quantidade = this.get('quantidade');
    if (quantidade > 1) {
      this.set('quantidade', quantidade - 1);
    }
  },
});

// Coleção para armazenar os itens do carrinho
const Carrinho = Backbone.Collection.extend({
  model: CarrinhoItem,
  total() {
    return this.reduce((total, item) => {
      return total + item.get('quantidade') * item.get('preco');
    }, 0);
  },
});

// Instância do carrinho
const carrinho = new Carrinho();

// View para exibir um único produto
const ProdutoView = Backbone.View.extend({
  tagName: 'div',
  className: 'produto',
  template: _.template(`
    <img src="<%= imagem %>" alt="<%= nome %>">
    <h3><%= nome %></h3>
    <p><%= descricao %></p>
    <strong>R$ <%= preco.toFixed(2) %></strong>
    <button class="add-to-cart">Adicionar ao Carrinho</button>
  `),
  events: {
    'click .add-to-cart': 'adicionarAoCarrinho',
  },
  adicionarAoCarrinho() {
    const itemExistente = carrinho.findWhere({ nome: this.model.get('nome') });
    if (itemExistente) {
      // Se o produto já estiver no carrinho, incrementar a quantidade
      itemExistente.incrementarQuantidade();
    } else {
      // Se o produto não estiver no carrinho, adicioná-lo
      const novoItem = new CarrinhoItem(this.model.toJSON());
      carrinho.add(novoItem);
    }
    // Re-renderizar o carrinho após adicionar ou incrementar o produto
    carrinhoView.render();
  },
  render() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
});

// View para exibir todos os produtos
const ProdutosView = Backbone.View.extend({
  el: '#produtos',
  render() {
    this.collection.each((produto) => {
      const produtoView = new ProdutoView({ model: produto });
      this.$el.append(produtoView.render().el);
    });
  },
});

// View para exibir o carrinho
const CarrinhoView = Backbone.View.extend({
  el: '#carrinho',
  template: _.template(`
    <h3>Itens no Carrinho</h3>
    <ul>
      <% collection.each(function(item) { %>
        <li>
          <%= item.get('nome') %> - R$ <%= item.get('preco').toFixed(2) %> x 
          <span class="quantidade"><%= item.get('quantidade') %></span>
          <button class="decrementar">-</button>
          <button class="incrementar">+</button>
        </li>
      <% }); %>
    </ul>
    <h4>Total: R$ <%= total.toFixed(2) %></h4>
    <button class="finalizar-compra">Finalizar Compra</button>
  `),
  events: {
    'click .incrementar': 'incrementarQuantidade',
    'click .decrementar': 'decrementarQuantidade',
    'click .finalizar-compra': 'finalizarCompra',
  },
  incrementarQuantidade(e) {
    const item = this.getItemFromEvent(e);
    item.incrementarQuantidade();
  },
  decrementarQuantidade(e) {
    const item = this.getItemFromEvent(e);
    item.decrementarQuantidade();
  },
  getItemFromEvent(e) {
    const itemNome = $(e.target).closest('li').find('span').text();
    return carrinho.findWhere({ nome: itemNome });
  },
  finalizarCompra() {
    alert('Compra finalizada com sucesso! Obrigado pela compra.');
    carrinho.reset(); // Limpa o carrinho após finalização
    this.render(); // Re-renderiza o carrinho vazio
  },
  render() {
    this.$el.html(
      this.template({
        collection: this.collection,
        total: this.collection.total(),
      })
    );
    return this;
  },
});

// Renderiza a lista de produtos
const produtosView = new ProdutosView({ collection: produtos });
produtosView.render();

// Renderiza o carrinho
const carrinhoView = new CarrinhoView({ collection: carrinho });
carrinhoView.render();
