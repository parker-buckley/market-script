import { HighScoreData } from "./types/global";

export function RenderHighScores ( highScoreData: HighScoreData ) {
    return (
        <div className="items-center">
        <h1>HI-SCORES</h1>
        <ol className="pl-8 list-decimal">
            { highScoreData.map( highScoreData => (
                <li>{highScoreData.name}: {highScoreData.score}, {highScoreData.date}</li>
            ))}
        </ol>
        </div>
    )
}