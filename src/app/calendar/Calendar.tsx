import { useState, useEffect } from "react";
import { differenceInDays, endOfMonth, startOfMonth, sub, format, add, setDate, formatISO, parse } from "date-fns";
import { account, databases } from "../appwrite";
import Cell from "./Cell";
import { get } from "http";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
    value?: Date;
    onChange?: (value: Date) => void;
    id: string;
}

const Calendar: React.FC<Props> = ({ value = new Date(), onChange, id }) => {
    const [checkedDays, setCheckedDays] = useState([])
    const startDate = startOfMonth(value);
    const endDate = endOfMonth(value);
    const numDays = differenceInDays(endDate, startDate) + 1;
    const checkedDayNumbers = checkedDays.map(dateString => new Date(dateString)).map(date => date.getDate())
    const [currentUserID, setCurrentUserID] = useState<string>('');
 
    useEffect(() => {
       async function getData() {
            const getHabit = await databases.getDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
                `${id}`,
            );
        setCheckedDays(getHabit.Dates)
       }
       getData();
    },  [])

    useEffect(() => {
        const fetchUser = async () => {
          const currentUser = await account.get();
          const userId = currentUser.$id;
          setCurrentUserID(userId);
        };
    
        fetchUser();
    }, []);

    const prefixDays = startDate.getDay();
    const suffixDays = 6 - endDate.getDay();

    const prevMonth = () => onChange && onChange(sub(value, { months: 1 }));
    const nextMonth = () => onChange && onChange(add(value, { months: 1 }));
    const prevYear = () => onChange && onChange(sub(value, { years: 1 }));
    const nextYear = () => onChange && onChange(add(value, { years: 1 }));

    const handleClickDate = async(index: number) => {
        const date = setDate(value, index);
        let checkedDays = [];
        onChange && onChange(date);
        const getHabit = await databases.getDocument(
            `${process.env.NEXT_PUBLIC_DB}`,
            `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
            `${id}`,
        );
        checkedDays = getHabit.Dates;
        checkedDays.push(date.toISOString());
        setCheckedDays(checkedDays)
        const addHabitDate = await databases.updateDocument(
            `${process.env.NEXT_PUBLIC_DB}`,
            `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
            `${id}`,
            {
                Dates: checkedDays
            },
        );
        addExperienceToTheUser();
        addStats();
    }

    const addExperienceToTheUser = async() => {
        const user = await databases.getDocument(
            `${process.env.NEXT_PUBLIC_DB}`,
            `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
            `${currentUserID}`
        );
        
        // Calculate required XP for a given level
        function calculateXP(level: number) {
            return 50 * Math.pow(level, 2); // Example formula
        }
        
        // Update XP in the database
        async function updateUserXP(currentUserID: string, newXP: number) {
            try {
            const response = await databases.updateDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
                `${currentUserID}`,
                { Experience: newXP } // Update XP field
            );
            console.log('XP updated:', response);
            } catch (error) {
            console.error('Failed to update XP:', error);
            }
        }
        
        // Update level in the database
        async function updateUserLevel(newLevel: number) {
            try {
            const response = await databases.updateDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
                `${currentUserID}`,
                { Level: newLevel } // Update level field
            );
            console.log('Level updated:', response);
            } catch (error) {
            console.error('Failed to update level:', error);
            }
        }
        
        // Handle XP Gain and Level Up Together
        async function gainXP(user: any, earnedXP: number) {
            // Update XP
            user.Experience += earnedXP;
            await updateUserXP(currentUserID, user.Experience); // Update XP immediately
        
            let leveledUp = false;
        
            // Check if user leveled up
            while (user.Experience >= calculateXP(user.Level + 1)) {
            user.Level += 1;
            leveledUp = true;
        
            // Update level in database
            await updateUserLevel(user.Level);
        
            console.log(`Congrats! You've leveled up to Level ${user.Level}`);
            }
        
            if (!leveledUp) {
            console.log('XP gained, but no level up.');
            }
        }
        
        gainXP(user, 100);
    }

    const addStats = async() => {
        const user = await databases.getDocument(
            `${process.env.NEXT_PUBLIC_DB}`,
            `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
            `${currentUserID}`
        );
        const habit = await databases.getDocument(
            `${process.env.NEXT_PUBLIC_DB}`,
            `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
            `${id}`,
        );

        if(habit.Type === "Strength") {
            let strength = user.Strength + 1;
            const addStatToTheUserInDB = await databases.updateDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
                `${currentUserID}`,
                {
                    Strength: strength
                },
            );
        }

        if(habit.Type === "Agility") {
            let agility = user.Agility + 1;
            const addStatToTheUserInDB = await databases.updateDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
                `${currentUserID}`,
                {
                    Agility: agility
                },
            );
        }

        if(habit.Type === "Inteligent") {
            let inteligent = user.Inteligent + 1;
            const addStatToTheUserInDB = await databases.updateDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
                `${currentUserID}`,
                {
                    Inteligent: inteligent
                },
            );
        }
    }

    return <div className="w-[400px] border-t border-l" id={id}>
        <div className="grid grid-cols-7 items-center justify-center text-center">
            <Cell onClick={prevYear}>{"<<"}</Cell>
            <Cell onClick={prevMonth}>{"<"}</Cell>
            <Cell className="col-span-3">{format(value, 'LLLL yyyy')}</Cell>
            <Cell onClick={nextMonth}>{">"}</Cell>
            <Cell onClick={nextYear}>{">>"}</Cell>

            {daysOfWeek.map((day) => (
                <Cell key={day} className="text-sm font-bold">{day}</Cell>
            ))}

            {Array.from({length: prefixDays}).map((_, index) => {
                return <Cell key={index}></Cell>;
            })}

            {Array.from({length: numDays}).map((_, index) => {
                const day = index + 1;
                const currentDate = setDate(value, day);
                
                const isCurrentDay = checkedDays.some(dateString => {
                    let date = new Date(dateString);
                    let dateCurrentString = date.toLocaleString();
                    let currentNewDate = currentDate.toLocaleString();
                    const newCurrentDate = currentNewDate.split(",");
                    const newDateCurrentString = dateCurrentString.split(",");
                    return newDateCurrentString[0] === newCurrentDate[0];
                })

            return <Cell onClick={() => handleClickDate(index + 1)} isCurrentDay={isCurrentDay} key={currentDate.toLocaleString()}>{day}</Cell>;
            })}

            {Array.from({length: suffixDays}).map((_, index) => {
                return <Cell key={index}></Cell>;
            })}
        </div>
    </div>;
};

export default Calendar;