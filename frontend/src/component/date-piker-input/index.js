import React, { useEffect, useState } from 'react';
import DatePicker,
{ registerLocale }
    from "react-datepicker";
import enUS from 'date-fns/locale/en-US';
import "react-datepicker/dist/react-datepicker.css";


registerLocale('en-us', enUS)

const DateInput = (props) => {

    function toUTC(date) {
        if (date) {
            let str = date.toString();
            str = str.substring(0, str.indexOf('-'));
            const dt = new Date(str);
            return dt;
        }
    }

    function change(date) {
        if (props.onChange) {
            props.onChange(toUTC(date));
        }
    }

    function toLocale(date) {
        if (date) {
            const dt = new Date(date);
            dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
            return dt;
        }
    }

    const [date, setDate] = useState(new Date());
    useEffect(() => {
        setDate(toLocale(props.value));
    }, [props.value])

    return (
        <DatePicker
            type="date"
            locale="en-us"
            dateFormat="yyyy-MM-dd HH:mm:ss"
            selected={date}
            onChange={change}
            className={props.className}
            showTimeSelect
            timeFormat="p"
            timeIntervals={1}
        />
    );
}

export default DateInput;