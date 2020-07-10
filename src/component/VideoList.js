import React from 'react'
import Video from './Video'
import '../css/VideoList.css'
import { observer } from 'mobx-react'
import { videoList, isLoading } from '../store/VideoStore'
import { i18n, LocaleContext } from '../i18n/i18n'

const VideoList = observer(class VideoList extends React.Component {

  componentDidUpdate () {
    this.turnDateToDaysAgo()
  }

  addCommmaToDigit (count) {
    if (count == null) {
      return '0'
    }
    var result = ''
    var digit = 0
    for (var i = count.length - 1; i >= 0; i--) {
      if (digit % 3 === 0 && i !== count.length - 1) {
        result = ',' + result
      }
      result = count[i] + result
      digit += 1
    }
    return result
  }

  turnDateToDaysAgo (date) {
    date = new Date(date)
    const today = new Date()
    var diff = (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()) - Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours())) / (1000 * 60 * 60 * 24)
    if (diff < 1) {
      diff = Math.round(diff * 24)
      if (diff <= 1) {
        return i18n(this.context.locale).videoList.less_than_1_hour_ago
      }
      return diff + i18n(this.context.locale).videoList.hours_ago
    }
    diff = Math.round(diff)
    if (diff === 1) {
      return diff + i18n(this.context.locale).videoList.day_ago
    }
    return diff + i18n(this.context.locale).videoList.days_ago
  }

  convertDuration (duration) {
    var result = '00:00:00'
    var tmp = ''
    var ind = 0
    for (var i = duration.length - 1; i > 0; i--) {
      if (duration[i] === 'S' || duration[i] === 'M' || duration[i] === 'H') {
        if (i !== duration.length - 1) {
          if (tmp.length < 2) {
            tmp += '0'
          }
          result = result.substring(0, ind) + tmp + result.substring(ind + 2)
        }
        if (duration[i] === 'S') {
          ind = 0
        } else if (duration[i] === 'M') {
          ind = 3
        } else if (duration[i] === 'H') {
          ind = 6
        }
        tmp = ''
        continue
      } else if (duration[i] === 'T') {
        if (tmp.length < 2) {
          tmp += '0'
        }
        result = result.substring(0, ind) + tmp + result.substring(ind + 2)
      }
      tmp += duration[i]
    }
    result = result.split('').reverse().join('')
    while (result[0] === '0' || result[0] === ':') {
      result = result.substring(1)
    }
    return result
  }

  pickThumbnail (video) {
    var thumbnailUrl = video.default.url
    if (video.maxres && video.maxres.url) {
      thumbnailUrl = video.maxres.url
    } else if (video.high.url && video.high.url) {
      thumbnailUrl = video.high.url
    } else if (video.standard && video.standard.url) {
      thumbnailUrl = video.standard.url
    } else if (video.medium && video.medium.url) {
      thumbnailUrl = video.medium.url
    }
    return thumbnailUrl
  }

  render () {
    if (isLoading.get()) {
      return <div id='loader'/>
    }
    return (
      <div id='videoList'>
        {videoList.get().map((video, index) => {
          const rank = index + 1
          const videoProps = {
            key: index,
            title: video.snippet.title.trim(),
            rank: rank,
            viewCount: this.addCommmaToDigit(video.statistics.viewCount),
            likeCount: this.addCommmaToDigit(video.statistics.likeCount),
            publishedAt: this.turnDateToDaysAgo(video.snippet.publishedAt),
            thumbnail: this.pickThumbnail(video.snippet.thumbnails),
            channelTitle: video.snippet.channelTitle,
            videoLink: 'https://www.youtube.com/watch?v=' + video.id,
            channelLink: 'https://www.youtube.com/channel/' + video.snippet.channelId,
            duration: this.convertDuration(video.contentDetails.duration)
          }
          return <Video {...videoProps}/>
        })}
      </div>
    )
  }
})

VideoList.contextType = LocaleContext

export default VideoList
