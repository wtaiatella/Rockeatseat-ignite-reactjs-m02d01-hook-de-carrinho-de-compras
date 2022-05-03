import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
//import { textSpanEnd } from 'typescript';

interface Product {
	id: number;
	title: string;
	price: number;
	image: string;
}

interface ProductFormatted extends Product {
	priceFormatted: string;
}

interface CartItemsAmount {
	[key: number]: number;
}

const Home = (): JSX.Element => {
	const [products, setProducts] = useState<ProductFormatted[]>([]);
	const { addProduct, cart } = useCart();

	const cartItemsAmount = cart.reduce((sumAmount, product) => {
		// TODO
		sumAmount[product.id] = product.amount;
		return sumAmount;
	}, {} as CartItemsAmount);

	useEffect(() => {
		async function loadProducts() {
			// TODO
			api.get('/products').then((response) => {
				console.log(
					'data para mostrar no dashboard: ',
					typeof response.data,
					response.data
				);

				setProducts(
					response.data.map((item: Product) => ({
						id: item.id,
						title: item.title,
						price: item.price,
						priceFormatted: formatPrice(item.price),
						image: item.image,
					}))
				);
			});
		}

		loadProducts();
	}, []);

	function handleAddProduct(id: number) {
		// TODO
		addProduct(id);
	}

	return (
		<ProductList>
			{products.map((product: ProductFormatted) => (
				<li key={product.id}>
					<img src={product.image} alt={product.title} />
					<strong>{product.title}</strong>
					<span>{product.priceFormatted}</span>
					<button
						type='button'
						data-testid='add-product-button'
						onClick={() => handleAddProduct(product.id)}
					>
						<div data-testid='cart-product-quantity'>
							<MdAddShoppingCart size={16} color='#FFF' />
							{cartItemsAmount[product.id] || 0}
						</div>

						<span>ADICIONAR AO CARRINHO</span>
					</button>
				</li>
			))}
		</ProductList>
	);
};

export default Home;
