import React from 'react';
import {
  StyleSheet,
  Button,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import FilmList from './FilmList';
import {getFilmsFromApiWithSearchedText} from '../API/TMDBApi';
import {connect} from 'react-redux';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      films: [],
      isLoading: false,
    };
    this.searchedText = '';
    this.page = 0;
    this.totalPages = 1;
    this._loadFilms = this._loadFilms.bind(this);
  }
  _searchFilms() {
    this.page = 0;
    this.totalPages = 0;
    this.setState(
      {
        films: [],
      },
      () => {
        this._loadFilms();
      },
    );
  }
  _loadFilms() {
    if (this.searchedText.length > 0) {
      this.setState({isLoading: true});
      getFilmsFromApiWithSearchedText(this.searchedText, this.page + 1).then(
        (data) => {
          this.page = data.page;
          this.totalPages = data.total_pages;
          this.setState({
            films: [...this.state.films, ...data.results],
            isLoading: false,
          });
        },
      );
    }
  }

  onChangeHanler(txt) {
    this.searchedText = txt;
  }

  _displayDetailForFilm = (idFilm) => {
    this.props.navigation.navigate('FilmDetail', {idFilm: idFilm});
  };
  render() {
    console.log('dddd');
    return (
      <View style={styles.main_container}>
        <TextInput
          style={styles.textInput}
          onChangeText={(txt) => this.onChangeHanler(txt)}
          onSubmitEditing={() => this._searchFilms()}
          placeholder="Film title"
        />
        <Button title="Search" onPress={this._searchFilms.bind(this)}></Button>
        <FilmList
          films={this.state.films} // C'est bien le component Search qui récupère les films depuis l'API et on les transmet ici pour que le component FilmList les affiche
          navigation={this.props.navigation} // Ici on transmet les informations de navigation pour permettre au component FilmList de naviguer vers le détail d'un film
          loadFilms={this._loadFilms} // _loadFilm charge les films suivants, ça concerne l'API, le component FilmList va juste appeler cette méthode quand l'utilisateur aura parcouru tous les films et c'est le component Search qui lui fournira les films suivants
          page={this.page}
          totalPages={this.totalPages} // les infos page et totalPages vont être utile, côté component FilmList, pour ne pas déclencher l'évènement pour charger plus de film si on a atteint la dernière page
        />

        {this.state.isLoading ? (
          <View style={styles.loading_container}>
            <ActivityIndicator size="large" color="#ddd" />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    marginTop: 20,
  },
  textInput: {
    padding: 10,
    margin: 5,
  },
  loading_container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// On connecte le store Redux, ainsi que les films favoris du state de notre application, à notre component Search
const mapStateToProps = (state) => {
  return {
    favoritesFilm: state.favoritesFilm,
  };
};

export default connect(mapStateToProps)(Search);
