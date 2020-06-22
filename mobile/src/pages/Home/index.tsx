import React, { useEffect, useState } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Image, StyleSheet, Text, ImageBackground, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import api from '../../services/api';

interface UF {
  id: number;
  sigla: string;
  nome: string;
}
interface City {
  id: number;
  nome: string;
}

const Home = () => {
  const [ufList, setUfList] = useState<UF[]>([]);
  const [city, setCity] = useState<City[]>([]);
  const [selectedUF, setSelectedUF] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const navigation = useNavigation();

  const handleNavigateToPoints = () => {
    if (selectedUF === '') {
      Alert.alert('Atenção', 'Por favor selecione um estado!');
      return;
    }
    if (selectedCity === '') {
      Alert.alert('Atenção', 'Por favor selecione uma cidade!');
      return;
    }
    navigation.navigate('Points', { selectedUF, selectedCity });
  };

  const DropDownUF = (ufList: UF[]) => {
    return (
      <RNPickerSelect
        style={{ placeholder: { color: '#6C6C80' } }}
        placeholder={{ label: 'Selecione um estado', color: '#34CB79', value: '' }}
        onValueChange={(value) => setSelectedUF(value)}
        items={ufList.map((uf) => ({ label: uf.nome, value: uf.sigla }))}
      />
    );
  };
  const DropDownCity = (cityList: City[]) => {
    return (
      <RNPickerSelect
        style={{ placeholder: { color: '#6C6C80' } }}
        disabled={selectedUF === ''}
        placeholder={{ label: 'Selecione uma cidade', color: '#34CB79', value: '' }}
        onValueChange={(value) => setSelectedCity(value)}
        items={cityList.map((city) => ({ label: city.nome, value: city.nome }))}
      />
    );
  };

  useEffect(() => {
    api
      .get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?OrderBy=nome')
      .then((response) => setUfList(response.data));
  }, []);

  useEffect(() => {
    setCity([]);
    setSelectedCity('');
    if (selectedUF === '') return;
    api
      .get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?OrderBy=nome`
      )
      .then((response) => {
        setCity(response.data);
      });
  }, [selectedUF]);

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}>
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>
          Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente
        </Text>
      </View>
      <View style={styles.dropDown}>{DropDownUF(ufList)}</View>
      <View style={styles.dropDown}>{DropDownCity(city)}</View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Icon name="arrow-right" color="#FFF" size={24} />
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  dropDown: {
    marginTop: 10,
    padding: 4,
    backgroundColor: '#DDD',
    borderRadius: 10,
  },
});

export default Home;
