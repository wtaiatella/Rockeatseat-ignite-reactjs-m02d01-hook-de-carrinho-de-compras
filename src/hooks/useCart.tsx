import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
//import { isTemplateExpression } from 'typescript';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
	children: ReactNode;
}

interface UpdateProductAmount {
	productId: number;
	amount: number;
}

interface CartContextData {
	cart: Product[];
	addProduct: (productId: number) => Promise<void>;
	removeProduct: (productId: number) => void;
	updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
	const [cart, setCart] = useState<Product[]>(() => {
		const storagedCart = localStorage.getItem('@RocketShoes:cart');
		if (storagedCart) {
			return JSON.parse(storagedCart);
		}
		return [];
	});

	/* 	//criar um useEffect que carrega o estoque
	const [stock, setStock] = useState<Stock[]>([]);
	useEffect(() => {
		api.get('/stock').then((response) => setStock(response.data));
	}, []); */

	let stock: Stock[];
	api.get('/stock/').then((response) => {
		stock = response.data;
	});

	const addProduct = async (productId: number) => {
		try {
			// TODO
			let newCart: Product[] = cart;

			//faz leitura do stock do produto ID
			const productStock = stock.reduce<number>((acc, item) => {
				if (productId === item.id) {
					acc = item.amount;
				}
				return acc;
			}, 0);

			console.log('qnt geral em estoque: ', stock);
			console.log('qnt estoque do ID: ', productStock);

			//recebe quantidade do produto com ID no cart atual
			let quantityInCart: number = cart.reduce<number>((acc, item) => {
				if (productId === item.id) {
					acc = item.amount;
				}
				return acc;
			}, 0);

			//verifica se tem estoque suficiente
			if (productStock < quantityInCart + 1) {
				//gerar erro
				throw new Error('Quantidade solicitada fora de estoque');
			}

			//verifica se ja existe no cart atual
			if (quantityInCart) {
				//se sim adiciona um
				newCart = cart.map((item: Product) => {
					if (item.id === productId) {
						item.amount += 1;
					}
					return item;
				});
				console.log('carrinho armazenado: ', newCart);
				setCart(newCart);
				localStorage.setItem(
					'@RocketShoes:cart',
					JSON.stringify(newCart)
				);
			} else {
				console.log(
					'carrinho antes de incluir novo produto: ' + newCart
				);
				//busca dados do produto para adicionar no carrinho
				let productInfo: Product;
				//recebe os dados do produto
				api.get('/products/' + productId)
					.then((response) => {
						if (response.data) {
							productInfo = response.data;
							productInfo.amount = 1;
							//verifica se é um carrinho vazio
							if (newCart) newCart = [...newCart, productInfo];
							else newCart = [productInfo];
							console.log('carrinho armazenado: ', newCart);
							setCart(newCart);
							localStorage.setItem(
								'@RocketShoes:cart',
								JSON.stringify(newCart)
							);
						} else {
							throw new Error('Erro na adição do produto');
						}
					})
					.then(() => console.log('carrinho armazenado: ', newCart));
			}
		} catch (err: unknown) {
			//} catch {
			// TODO
			if (err instanceof Error) toast.error(err.message);
		}
	};

	const removeProduct = (productId: number) => {
		try {
			// TODO
			let newCart: Product[] = cart;

			//verifica se o ID esta presente no carrinho
			//SIM: remove
			if (cart.some((item) => item.id === productId)) {
				newCart = cart.filter((item) => item.id !== productId);
				setCart(newCart);
				localStorage.setItem(
					'@RocketShoes:cart',
					JSON.stringify(newCart)
				);
			}
			//NÃO: gera erro
			else {
				throw new Error('Erro na remoção do produto');
			}
		} catch (err: unknown) {
			//} catch {
			// TODO
			if (err instanceof Error) toast.error(err.message);
		}
	};

	const updateProductAmount = async ({
		productId,
		amount,
	}: UpdateProductAmount) => {
		try {
			// TODO
			let newCart: Product[] = cart;

			console.log('cart antes do update =', cart);
			console.log('ProductId para update =', productId);
			console.log('Quantidade para update =', amount);

			//verifica productID no cart
			if (!cart.some((product) => product.id === productId)) {
				throw new Error('Erro na alteração de quantidade do produto');
			}

			//faz leitura do stock do produto ID
			const productStock = stock.reduce<number>((acc, item) => {
				if (productId === item.id) {
					acc = item.amount;
				}
				return acc;
			}, 0);

			console.log('Quantidade em estoque do produto =', productStock);

			/* 			//recebe quantidade do produto com ID no cart atual
			let quantityInCart: number = cart.reduce<number>((acc, item) => {
				if (productId === item.id) {
					acc = item.amount;
				}
				return acc;
			}, 0); */

			//se 1 adiciona do carrinho
			if (amount >= 1) {
				if (productStock >= amount) {
					newCart = cart.map((item: Product) => {
						if (item.id === productId) {
							item.amount = amount;
						}
						return item;
					});
				} else {
					throw new Error('Quantidade solicitada fora de estoque');
				}
			}
			/* //se não, diminui 1
			else {
				if (quantityInCart + amount > 0) {
					newCart = cart.map((item: Product) => {
						if (item.id === productId) {
							item.amount += amount;
						}
						return item;
					});
				}
			} */
			setCart(newCart);
			localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
		} catch (err: unknown) {
			//} catch {
			// TODO
			if (err instanceof Error) toast.error(err.message);
		}
	};

	return (
		<CartContext.Provider
			value={{ cart, addProduct, removeProduct, updateProductAmount }}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart(): CartContextData {
	const context = useContext(CartContext);

	return context;
}
