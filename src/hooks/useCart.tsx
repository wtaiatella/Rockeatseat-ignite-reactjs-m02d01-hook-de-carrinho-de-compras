import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
//import { isTemplateExpression } from 'typescript';
import { api } from '../services/api';
import { Product } from '../types';

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

	const addProduct = async (productId: number) => {
		try {
			// TODO
			let newCart: Product[] = [...cart];

			//faz leitura do stock do produto ID
			//const stock: Stock = await (await api.get('/stock/')).data;
			const productStock: number = await (
				await api.get(`stock/${productId}`)
			).data.amount;

			//console.log('qnt geral em estoque: ', stock);
			console.log('qnt estoque do ID: ', productStock);

			//recebe quantidade do produto com ID no cart atual
			let quantityInCart: number = newCart.reduce<number>((acc, item) => {
				if (productId === item.id) {
					acc = item.amount;
				}
				return acc;
			}, 0);

			console.log('qnt no carinho do ID: ', quantityInCart);
			//verifica se tem estoque suficiente
			if (productStock < quantityInCart + 1) {
				//gerar erro
				toast.error('Quantidade solicitada fora de estoque');
				return;
			}

			//verifica se ja existe no cart atual
			if (quantityInCart) {
				//se sim adiciona um
				newCart = newCart.map((item: Product) => {
					if (item.id === productId) {
						item.amount += 1;
					}
					return item;
				});
				console.log('carrinho armazenado: ', newCart);
			} else {
				console.log(
					'carrinho antes de incluir novo produto: ',
					newCart
				);

				//recebe os dados do produto
				const product = await api.get('/products/' + productId);

				const newProduct = {
					...product.data,
					amount: 1,
				};
				newCart.push(newProduct);

				console.log('carrinho armazenado: ', newCart);
			}
			setCart(newCart);
			localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
		} catch {
			//} catch {
			// TODO
			toast.error('Erro na adi????o do produto');
		}
	};

	const removeProduct = (productId: number) => {
		try {
			//TODO
			let newCart: Product[] = [...cart];

			//verifica se o ID esta presente no carrinho
			//SIM: remove
			if (newCart.some((item) => item.id === productId)) {
				newCart = newCart.filter((item) => item.id !== productId);
				setCart(newCart);
				localStorage.setItem(
					'@RocketShoes:cart',
					JSON.stringify(newCart)
				);
			}
			//N??O: gera erro
			else {
				throw new Error('Erro na remo????o do produto');
			}
		} catch (err: unknown) {
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
			let newCart: Product[] = [...cart];

			console.log('cart antes do update =', cart);
			console.log('ProductId para update =', productId);
			console.log('Quantidade para update =', amount);

			//Se a quantidade do produto for menor ou igual a zero
			if (amount <= 0) return;

			//verifica productID no cart
			if (!cart.some((product) => product.id === productId)) {
				throw new Error('Erro na altera????o de quantidade do produto');
			}

			//faz leitura do stock do produto ID
			const productStock: number = await (
				await api.get(`stock/${productId}`)
			).data.amount;

			console.log('Quantidade em estoque do produto =', productStock);

			//se 1 adiciona do carrinho

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
