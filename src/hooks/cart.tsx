/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const localCart = await AsyncStorage.getItem('@GoMarketplace:products');

      if (localCart) {
        setProducts(JSON.parse(localCart));
      } else setProducts([]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const alreadyInTheCart = products.find(e => e.id === product.id);

      if (alreadyInTheCart) {
        const newProductsArray = products.filter(e => e.id !== product.id);
        alreadyInTheCart.quantity += 1;

        newProductsArray.push(alreadyInTheCart);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsArray),
        );

        setProducts(newProductsArray);
      } else {
        const newProduct: Product = {
          id: product.id,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
          title: product.title,
        };

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, newProduct]),
        );

        setProducts([...products, newProduct]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const toIncrease = products.find(e => e.id === id) || null;

      if (toIncrease) {
        const newProductsArray = products.filter(e => e.id !== id);
        toIncrease.quantity += 1;

        newProductsArray.push(toIncrease);

        console.log(newProductsArray);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsArray),
        );

        setProducts(newProductsArray);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const toDecrease = products.find(e => e.id === id) || null;

      if (toDecrease) {
        const newProductsArray = products.filter(e => e.id !== id);

        if (toDecrease.quantity > 1) {
          toDecrease.quantity -= 1;

          newProductsArray.push(toDecrease);
        }

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProductsArray),
        );

        setProducts(newProductsArray);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
