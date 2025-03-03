// Components/FilmDetail.js

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import {getFilmDetailFromApi, getImageFromApi} from '../API/TMDBApi';
import moment from 'moment';
import numeral from 'numeral';
import {connect} from 'react-redux';
import EnlargeShrink from '../Animations/EnlargeShrink';
class FilmDetail extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params} = navigation.state;
    // On accède à la fonction shareFilm et au film via les paramètres qu'on a ajouté à la navigation
    if (params.film != undefined && Platform.OS === 'ios') {
      return {
        // On a besoin d'afficher une image, il faut donc passe par une Touchable une fois de plus
        headerRight: (
          <TouchableOpacity
            style={styles.share_touchable_headerrightbutton}
            onPress={() => params.shareFilm()}>
            <Image
              style={styles.share_image}
              source={require('../Images/ic_share.png')}
            />
          </TouchableOpacity>
        ),
      };
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      film: undefined,
      isLoading: true,
    };
    //this.shareFilm = this.shareFilm.bind(this);
  }
  _updateNavigationParams() {
    this.props.navigation.setParams({
      shareFilm: this._shareFilm,
      film: this.state.film,
    });
  }
  componentDidMount() {
    const favoriteFilmIndex = this.props.favoritesFilm.findIndex(
      (item) => item.id === this.props.navigation.state.params.idFilm,
    );
    if (favoriteFilmIndex !== -1) {
      this.setState(
        {
          film: this.props.favoritesFilm[favoriteFilmIndex],
        },
        () => {
          this._updateNavigationParams();
        },
      );
      return;
    }

    this.setState({isLoading: true});
    getFilmDetailFromApi(this.props.navigation.state.params.idFilm).then(
      (data) => {
        this.setState(
          {
            film: data,
            isLoading: false,
          },
          () => {
            this._updateNavigationParams();
          },
        );
      },
    );
  }

  _toggleFavorite() {
    const action = {type: 'TOGGLE_FAVORITE', value: this.state.film};
    this.props.dispatch(action);
  }
  _displayLoading() {
    if (this.state.isLoading) {
      return (
        <View style={styles.loading_container}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
  }
  _displayLoading() {
    if (this.state.isLoading) {
      return (
        <View style={styles.loading_container}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
  }
  _displayFavoriteImage() {
    var sourceImage = require('../Images/ic_favorite_border.png');
    var shouldEnlarge = false; // Par défaut, si le film n'est pas en favoris, on veut qu'au clic sur le bouton, celui-ci s'agrandisse => shouldEnlarge à true
    if (
      this.props.favoritesFilm.findIndex(
        (item) => item.id === this.state.film.id,
      ) !== -1
    ) {
      sourceImage = require('../Images/ic_favorite.png');
      shouldEnlarge = true; // Si le film est dans les favoris, on veut qu'au clic sur le bouton, celui-ci se rétrécisse => shouldEnlarge à false
    }
    return (
      <EnlargeShrink shouldEnlarge={shouldEnlarge}>
        <Image style={styles.favorite_image} source={sourceImage} />
      </EnlargeShrink>
    );
  }
  _displayFilm() {
    const {film} = this.state;
    if (film != undefined) {
      return (
        <ScrollView style={styles.scrollview_container}>
          <Image
            style={styles.image}
            source={{uri: getImageFromApi(film.backdrop_path)}}
          />
          <TouchableOpacity
            style={styles.favorite_container}
            onPress={() => this._toggleFavorite()}>
            {this._displayFavoriteImage()}
          </TouchableOpacity>
          <Text style={styles.title_text}>{film.title}</Text>
          <Text style={styles.description_text}>{film.overview}</Text>
          <Text style={styles.default_text}>
            Release date:{' '}
            {moment(new Date(film.release_date)).format('DD/MM/YYYY')}
          </Text>
          <Text style={styles.default_text}>
            Vote average: {film.vote_average} / 10
          </Text>
          <Text style={styles.default_text}>Vote count: {film.vote_count}</Text>
          <Text style={styles.default_text}>
            Budget : {numeral(film.budget).format('0,0[.]00 $')}
          </Text>
          <Text style={styles.default_text}>
            Genre(s) :{' '}
            {film.genres
              .map(function (genre) {
                return genre.name;
              })
              .join(' / ')}
          </Text>
          <Text style={styles.default_text}>
            Company(ies) :{' '}
            {film.production_companies
              .map(function (company) {
                return company.name;
              })
              .join(' / ')}
          </Text>
        </ScrollView>
      );
    }
  }
  _shareFilm = () => {
    const {film} = this.state;
    Share.share({title: film.title, message: film.overview});
  };
  _displayFloatingActionButton() {
    const {film} = this.state;
    if (film != undefined && Platform.OS === 'android') {
      // Uniquement sur Android et lorsque le film est chargé
      return (
        <TouchableOpacity
          style={styles.share_touchable_floatingactionbutton}
          onPress={() => this._shareFilm()}>
          <Image
            style={styles.share_image}
            source={require('../Images/ic_share.png')}
          />
        </TouchableOpacity>
      );
    }
  }

  render() {
    return (
      <View style={styles.main_container}>
        {this._displayLoading()}
        {this._displayFilm()}
        {this._displayFloatingActionButton()}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  main_container: {
    fontFamily: 'Chilanka-Regular.ttf',
    flex: 1,
  },
  favorite_container: {
    alignItems: 'center', // Alignement des components enfants sur l'axe secondaire, X ici
  },
  favorite_image: {
    flex: 1,
    width: null,
    height: null,
  },
  loading_container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollview_container: {
    flex: 1,
  },
  image: {
    height: 169,
    margin: 5,
  },
  title_text: {
    fontWeight: 'bold',
    fontSize: 35,
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    color: '#000000',
    textAlign: 'center',
  },
  description_text: {
    fontStyle: 'italic',
    color: '#666666',
    margin: 5,
    marginBottom: 15,
  },
  share_touchable_floatingactionbutton: {
    position: 'absolute',
    width: 60,
    height: 60,
    right: 30,
    bottom: 30,
    borderRadius: 30,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  share_image: {
    width: 30,
    height: 30,
  },
  default_text: {
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
  },
});

const mapStateToProps = (state) => {
  return {
    favoritesFilm: state.toggleFavorite.favoritesFilm,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: (action) => {
      dispatch(action);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FilmDetail);
