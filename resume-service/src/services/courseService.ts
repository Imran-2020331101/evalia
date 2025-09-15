import { Course, ICourse, IThumbnails, SearchResult } from "../models/CourseSchema";
import axios from "axios";

class CourseService{
    
    async searchYoutube(query : string , maxResults : number = 5) : Promise<SearchResult>{

        const response = await axios.get( "https://www.googleapis.com/youtube/v3/search",{
            params: {
                part: "snippet",
                query,
                type: "video",
                maxResults,
                key: process.env.YT_API_KEY,
            }});

        const courses : ICourse[] = response.data.items.map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                thumbnails: item.snippet.thumbnails,
                publishedAt: item.snippet.publishedAt,
            }));

        return {
            courses,
            nextPageToken: response.data.nextPageToken,
            totalResults: response.data.pageInfo.totalResults,
        }
    }

    async saveCourse( courseDetails : ICourse ) : Promise<ICourse>{
        const course = new Course(courseDetails);
        const savedCourse = await course.save();
        return savedCourse as ICourse;
    }

    async searchSavedCourse( query: string ) : Promise<ICourse[]> {
        return await Course.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ],
        });
    }
}

export const courseService = new CourseService();