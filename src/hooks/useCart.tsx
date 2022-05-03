import {
	createContext,
	ReactNode,
	useContext,
	useState,
	useEffect,
} from 'react';
//import { toast } from 'react-toastify';
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
		// const storagedCart = Buscar dados do localStorage

		// if (storagedCart) {
		//   return JSON.parse(storagedCart);
		// }

		return [];
	});

	//criar um useEffect que carrega o estoque
	const [stock, setStock] = useState<Stock[]>([]);
	useEffect(() => {
		api.get('/stock').then((response) => setStock(response.data));
	}, []);

	const addProduct = async (productId: number) => {
		try {
			// TODO
			//verifica se tem estoque
			const productStock = stock.filter((item) => {
				return item.id === productId;
			});

			console.log('qnt em estoque: ', stock);

			console.log('qnt estoque do ID: ', productStock);

			//if (stock[productId].amount === 3)
			setCart([
				{
					id: 0,
					title: 'Produto teste do useEffect',
					price: 500,
					image: 'https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis1.jpg',
					amount: 2,
				},
			]);
		} catch {
			// TODO
		}
	};

	const removeProduct = (productId: number) => {
		try {
			// TODO
		} catch {
			// TODO
		}
	};

	const updateProductAmount = async ({
		productId,
		amount,
	}: UpdateProductAmount) => {
		try {
			// TODO
			const estoque: Stock = {
				id: 4,
				amount: 4,
			};
			console.log(estoque);
		} catch {
			// TODO
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
