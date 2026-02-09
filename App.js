import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

// Importamos tus pantallas
import BootScreen from './src/screens/BootScreen'; // <--- Importamos la nueva pantalla
import CerebroScreen from './src/screens/CerebroScreen';
import FinanceScreen from './src/screens/FinanceScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    // Estado para controlar si estamos "booteando"
    const [isBooting, setIsBooting] = useState(true);

    // Si está booteando, mostramos la pantalla de carga y nada más
    if (isBooting) {
        return <BootScreen onFinish={() => setIsBooting(false)} />;
    }

    // Cuando termina (isBooting = false), mostramos la App normal
    return (
        <NavigationContainer>
            <StatusBar style="light" />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: '#0f172a',
                        borderTopWidth: 0,
                        height: 60,
                        paddingBottom: 10,
                    },
                    tabBarActiveTintColor: '#38bdf8',
                    tabBarInactiveTintColor: '#64748b',
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Inicio') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Finanzas') {
                            iconName = focused ? 'wallet' : 'wallet-outline';
                        } else if (route.name === 'Cerebro') {
                            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
                        } else if (route.name === 'Perfil') {
                            iconName = focused ? 'person' : 'person-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                })}
            >
                <Tab.Screen name="Inicio" component={HomeScreen} />
                <Tab.Screen name="Finanzas" component={FinanceScreen} />
                <Tab.Screen name="Cerebro" component={CerebroScreen} />
                <Tab.Screen name="Perfil" component={ProfileScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}