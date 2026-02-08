import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';


// Importamos tus pantallas
import CerebroScreen from '../screens/CerebroScreen';
import FinanceScreen from '../screens/FinanceScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Creamos una pantalla vacía temporal para probar el menú
import { Text, View } from 'react-native';
const PlaceholderScreen = ({ name }) => (
    <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#38bdf8', fontSize: 20 }}>Módulo: {name}</Text>
    </View>
);

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false, // Ocultamos el título de arriba
                    tabBarStyle: {
                        backgroundColor: '#1e293b', // Color de la barra
                        borderTopColor: '#334155',
                        height: 60,
                        paddingBottom: 8,
                    },
                    tabBarActiveTintColor: '#38bdf8', // Color del ícono activo (Cyan)
                    tabBarInactiveTintColor: '#64748b', // Color inactivo (Gris)
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Inicio') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Finanzas') {
                            iconName = focused ? 'wallet' : 'wallet-outline';
                        } else if (route.name === 'Cerebro') {
                            iconName = focused ? 'book' : 'book-outline';
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