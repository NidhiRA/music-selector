import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SongsService } from '../utility/songs.service';
import { SiteHelper } from '../utility/SiteHelper';

import { Song } from '../song.model';

@Component({
  selector: 'app-who-is-up',
  templateUrl: './who-is-up.component.html',
  styleUrls: ['./who-is-up.component.scss'],
})
export class WhoIsUpComponent implements OnInit, AfterViewInit {
  date = '';
  genre = '';
  selector = '';
  song = '';
  today = new Date();
  todayMonday = false;
  siteHelper: SiteHelper;

  activeSong: Song;

  list = [];
  pageSize = 25;
  simpleSongList = [];
  startIndex = 0;
  todayAsString: string;

  editGenre: boolean;
  edittingGenre: boolean;
  genrePlaceholder = '';

  editSong: boolean;
  edittingSong: boolean;
  songPlaceholder = '';

  startDate = '4/20/2020';
  daysToGenerate = 1826;
  breakpoint = 5;

  constructor(private songsService: SongsService) {
    this.siteHelper = new SiteHelper(songsService);
    this.todayAsString = this.siteHelper.getFormattedDateString(this.today);
    this.activeSong = new Song();
    // this.setActiveSong(this.todayAsString);
    this.edittingGenre = false;
    this.edittingSong = false;

    const dateIterator = new Date(this.startDate);
    for (let idx = 0; idx < this.daysToGenerate; ++idx) {
      // console.log(this.siteHelper.getFormattedDateString(startDateAsDate));
      if (dateIterator.getDay() > 0 && dateIterator.getDay() < 6) {
        this.list.push({
          title: this.siteHelper.getFormattedDateString(dateIterator),
        });
      }
      dateIterator.setDate(dateIterator.getDate() + 1);
    }

    // - get offset from start of time
    console.log(this.list);
    const start = new Date(this.list[0]['title']);
    const end = new Date(this.siteHelper.getFormattedDateString(this.today));
    console.log('after date pulls');

    // To calculate the time difference of two dates
    const Difference_In_Time = end.getTime() - start.getTime();

    // To calculate the no. of days between two dates
    const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    // To display the final no. of days (result)
    this.startIndex = Math.trunc(Difference_In_Days / this.pageSize) - 1;

    // - set the pagination to the current date to start with
    this.onPageChange({ pageIndex: this.startIndex, pageSize: this.pageSize });

    // this.simpleSongList = this.list.slice(this.startIndex, this.pageSize);
  }

  ngOnInit(): void {
    // if (window.innerWidth <= 400) {
    //   this.breakpoint = 1;
    //   this.pageSize = 1;
    // } else {
    //   this.breakpoint = 5;
    //   this.pageSize = 25;
    // }
  }

  ngAfterViewInit() {
    // console.log(document.getElementById('songLink'));
    this.setActiveSong(this.todayAsString);
  }

  setActiveSong(date: string) {
    // console.log(this.today);
    // console.log(`${this.today.getMonth()}`);
    // console.log(`${this.today.getDate()}`);
    // console.log(`${this.today.getFullYear()}`);
    console.log('Setting Active Song Date: ' + date);
    this.siteHelper.getSongAtDate(date).then((result) => {
      console.log(result);
      this.activeSong = result;
      (document.getElementById(
        'songLink'
      ) as HTMLLinkElement).href = this.activeSong.song;

      this.activeSong.thumbsUp = this.siteHelper.isEmptyOrSpaces(
        this.activeSong.thumbsUp
      )
        ? '0'
        : this.activeSong.thumbsUp;
      this.activeSong.thumbsDowm = this.siteHelper.isEmptyOrSpaces(
        this.activeSong.thumbsDowm
      )
        ? '0'
        : this.activeSong.thumbsDowm;
    });

    this.editGenre = false;
    this.edittingGenre = false;
    if (new Date(date).getDay() === 1) {
      this.editGenre = true;
    } else {
      this.siteHelper
        .getSongAtDate(this.siteHelper.getNearestMonday(date))
        .then((result) => {
          this.activeSong.genre = result.genre;
        });
    }
  }

  onPageChange(e) {
    console.log('changing page: ', e);
    this.simpleSongList = this.list.slice(
      e.pageIndex * e.pageSize,
      (e.pageIndex + 1) * e.pageSize
    );
  }

  changeActiveCard(e) {
    // console.log(e);
    console.log('change event, active card: ', e.target.innerText);

    this.setActiveSong(e.target.innerText);
  }

  onEditGenre(e) {
    this.edittingGenre = true;
  }

  onEdittingGenreSave(e) {
    console.log(
      'in genre save: ',
      (document.getElementById('newGenre') as HTMLInputElement).value,
      this.activeSong
    );
    this.edittingGenre = false;

    const newData = JSON.parse(JSON.stringify(this.activeSong));
    console.log('Sending song to database:', newData);
    newData.genre = (document.getElementById(
      'newGenre'
    ) as HTMLInputElement).value;
    this.siteHelper.updateSongAtDate(newData);
    this.activeSong = newData;
  }

  onEdittingGenreCancel(e) {
    console.log('in genre cancel');
    this.edittingGenre = false;
  }

  onEditSong(e) {
    this.edittingSong = true;
  }

  onEdittingSongSave(e) {
    console.log(
      'in song save: ',
      (document.getElementById('newSong') as HTMLInputElement).value,
      this.activeSong
    );
    this.edittingSong = false;

    const newData = JSON.parse(JSON.stringify(this.activeSong));
    console.log('Sending song to database:', newData);
    newData.song = (document.getElementById(
      'newSong'
    ) as HTMLInputElement).value;
    this.siteHelper.updateSongAtDate(newData);
    this.activeSong = newData;
  }

  onEdittingSongCancel(e) {
    console.log('in song cancel');
    this.edittingSong = false;
  }

  onResize(event) {
    // if (event.target.innerWidth <= 400) {
    //   this.breakpoint = 1;
    //   this.pageSize = 1;
    // } else {
    //   this.breakpoint = 5;
    //   this.pageSize = 25;
    // }
  }

  onThumbsUp(event) {
    console.log('In Thumbs Up Event');

    const newData = JSON.parse(JSON.stringify(this.activeSong));
    console.log('Sending song to database:', newData);
    newData.thumbsUp = +newData.thumbsUp + 1;
    // newData.thumbsUp = 0; // reset
    this.siteHelper.updateSongAtDate(newData);
    this.activeSong = newData;
  }

  onThumbsDown(event) {
    console.log('In Thumbs Down Event');

    const newData = JSON.parse(JSON.stringify(this.activeSong));
    console.log('Sending song to database:', newData);
    newData.thumbsDowm = +newData.thumbsDowm + 1;
    // newData.thumbsDowm = 0; // reset
    this.siteHelper.updateSongAtDate(newData);
    this.activeSong = newData;
  }
}
