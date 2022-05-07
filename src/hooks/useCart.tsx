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
			toast.error('Erro na adição do produto');
		}
	};

	const removeProduct = (productId: number) => {
		try {
			// TODO
		} catch {}
	};

	const updateProductAmount = async ({
		productId,
		amount,
	}: UpdateProductAmount) => {
		try {
			// TODO
		} catch {}
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
