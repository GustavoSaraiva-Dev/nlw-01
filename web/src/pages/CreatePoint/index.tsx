import React, { useEffect, useState, ChangeEvent, FormEvent, useRef } from 'react';
import './styles.css';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import * as L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import DropZone from '../../components/DropZone';
import logo from '../../assets/logo.svg';
import recycle from '../../assets/pin.svg';

const CreatePoint = () => {
  interface Item {
    id: number;
    image_url: string;
    title: string;
  }
  interface UF {
    id: number;
    sigla: string;
    nome: string;
  }
  interface City {
    id: number;
    nome: string;
  }

  interface Point {
    name: string;
    email: string;
    whatsapp: string;
  }

  interface PointData {
    name: string;
    email: string;
    whatsapp: string;
    uf: string;
    city: string;
    latitude: number;
    longitude: number;
    items: number[];
  }

  const [items, setItems] = useState<Item[]>([]);
  const [ufList, setUfList] = useState<UF[]>([]);
  const [city, setCity] = useState<City[]>([]);
  const [selectedUF, setSelectedUF] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [formData, setFormData] = useState<Point>({
    name: '',
    email: '',
    whatsapp: '',
  });
  const cityRef = useRef<HTMLSelectElement>(null);
  const sucessRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setInitialPosition([position.coords.latitude, position.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?OrderBy=nome')
      .then((response) => {
        setUfList(response.data);
      });
  }, []);

  useEffect(() => {
    setCity([]);
    if (selectedUF === '') return;
    axios
      .get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?OrderBy=nome`
      )
      .then((response) => {
        setCity(response.data);
      });
  }, [selectedUF]);

  const handleSelectUF = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUF(event.target.value);
  };
  const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };
  const handleMapClick = (event: L.LeafletMouseEvent) => {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  };

  const pinRecycle = L.icon({
    iconUrl: recycle,
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    popupAnchor: [0, -64],
  });

  const handdleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectItem = (id: number) => {
    const alreadySelected = selectedItems.findIndex((item) => item === id);
    alreadySelected >= 0
      ? setSelectedItems(selectedItems.filter((item) => item !== id))
      : setSelectedItems([...selectedItems, id]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if (selectedFile) data.append('image', selectedFile);

    await api.post('/points', data);

    sucessRef.current?.classList.toggle('show');
  };

  const handleClass = () => {
    sucessRef.current?.classList.toggle('show');
  };
  return (
    <div id="page-create-point">
      <div className="sucess-page" ref={sucessRef}>
        <span style={{ color: 'white' }}>Sucesso</span>
        <button onClick={handleClass}>Voltar para home</button>
      </div>
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do
          <br /> ponto de coleta
        </h1>

        <DropZone onfileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da Identidade</label>
            <input type="text" name="name" id="name" onChange={handdleInputChange} />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handdleInputChange} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handdleInputChange} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} draggable={true} icon={pinRecycle}>
              <Popup>
                <ul style={{ listStyle: 'none' }}>
                  {items.map((item) => (
                    <li key={item.id}>
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </Popup>
            </Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUF} onChange={(e) => handleSelectUF(e)}>
                <option value={0}> Selecione uma UF</option>
                {ufList.map((UF) => (
                  <option key={UF.id} value={UF.sigla}>
                    {UF.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                ref={cityRef}
                disabled={city.length === 0}
                onChange={(e) => handleSelectCity(e)}>
                <option value={0}> Selecione uma Cidade</option>
                {city.map((city) => (
                  <option key={city.id} value={city.nome}>
                    {city.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}>
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
