package in.techdive.http;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

public class SessionCounter implements HttpSessionListener
{
        private static int count;

        public SessionCounter()
        {
        }

        public void sessionCreated(HttpSessionEvent arg0)
        {
                count++;
                ServletContext sContext = arg0.getSession().getServletContext();
                synchronized (sContext)
                {
                        sContext.setAttribute("sessionCount", new Integer(count));
                }
        }

        public void sessionDestroyed(HttpSessionEvent arg0)
        {
                count--;
                ServletContext sContext = arg0.getSession().getServletContext();
                synchronized (sContext)
                {
                        sContext.setAttribute("sessionCount", new Integer(count));
                }
        }
}
